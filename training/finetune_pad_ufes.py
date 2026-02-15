import argparse
import csv
from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional, Tuple

import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Dataset, random_split
from torchvision import models, transforms
from PIL import Image

DEFAULT_HIGH = {"MEL", "SCC", "SEK"}
DEFAULT_MEDIUM = {"BCC", "ACK"}


@dataclass
class Sample:
    image_path: Path
    label: int


def parse_labels(value: Optional[str]) -> set[str]:
    if not value:
        return set()
    return {item.strip().upper() for item in value.split(",") if item.strip()}


def build_image_index(image_dirs: List[Path]) -> dict[str, Path]:
    index = {}
    for directory in image_dirs:
        if not directory.exists():
            continue
        for path in directory.rglob("*"):
            if path.is_file() and path.suffix.lower() in {".png", ".jpg", ".jpeg"}:
                index[path.name] = path
    if not index:
        raise FileNotFoundError("No images found in provided PAD-UFES image folders.")
    return index


def load_metadata(
    csv_path: Path,
    image_index: dict[str, Path],
    label_col: str,
    high_labels: set[str],
    medium_labels: set[str],
) -> List[Sample]:
    samples: List[Sample] = []
    missing_images = 0
    with csv_path.open("r", newline="") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            image_id = row.get("img_id")
            label_raw = row.get(label_col)
            if not image_id or not label_raw:
                continue
            image_path = image_index.get(image_id)
            if not image_path:
                missing_images += 1
                continue
            label = label_raw.strip().upper()
            if label in high_labels:
                risk = 2
            elif label in medium_labels:
                risk = 1
            else:
                risk = 0
            samples.append(Sample(image_path=image_path, label=risk))
    if not samples:
        raise ValueError("No samples found. Check CSV columns and image paths.")
    if missing_images:
        print(f"Skipped {missing_images} rows with missing images.")
    return samples


class PadDataset(Dataset):
    def __init__(self, samples: List[Sample], transform):
        self.samples = samples
        self.transform = transform

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, int]:
        sample = self.samples[idx]
        image = Image.open(sample.image_path).convert("RGB")
        image = self.transform(image)
        return image, sample.label


def build_model(num_classes: int) -> nn.Module:
    model = models.efficientnet_b2(weights=models.EfficientNet_B2_Weights.IMAGENET1K_V1)
    in_features = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(in_features, num_classes)
    return model


def train_one_epoch(model, loader, criterion, optimizer, device):
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0
    for images, labels in loader:
        images = images.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item() * images.size(0)
        preds = outputs.argmax(dim=1)
        correct += (preds == labels).sum().item()
        total += labels.size(0)

    return running_loss / total, correct / total


def evaluate(model, loader, criterion, device):
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0
    num_classes = 3
    confusion = torch.zeros((num_classes, num_classes), dtype=torch.int64)
    with torch.no_grad():
        for images, labels in loader:
            images = images.to(device)
            labels = labels.to(device)
            outputs = model(images)
            loss = criterion(outputs, labels)

            running_loss += loss.item() * images.size(0)
            preds = outputs.argmax(dim=1)
            correct += (preds == labels).sum().item()
            total += labels.size(0)
            for target, pred in zip(labels.view(-1), preds.view(-1)):
                confusion[target.long(), pred.long()] += 1

    return running_loss / total, correct / total, confusion


def high_risk_f1(confusion: torch.Tensor, high_index: int = 2) -> Tuple[float, float, float]:
    tp = confusion[high_index, high_index].item()
    fp = confusion[:, high_index].sum().item() - tp
    fn = confusion[high_index, :].sum().item() - tp
    precision = tp / (tp + fp) if (tp + fp) else 0.0
    recall = tp / (tp + fn) if (tp + fn) else 0.0
    f1 = (2 * precision * recall / (precision + recall)) if (precision + recall) else 0.0
    return precision, recall, f1


def main():
    parser = argparse.ArgumentParser(description="Finetune EfficientNet-B2 on PAD-UFES-20")
    parser.add_argument("--data-dirs", nargs="+", required=True, help="Image folders")
    parser.add_argument("--csv-path", required=True, help="Path to metadata CSV")
    parser.add_argument("--label-col", default="diagnostic", help="CSV column for diagnosis")
    parser.add_argument("--high-labels", default=",".join(DEFAULT_HIGH))
    parser.add_argument("--medium-labels", default=",".join(DEFAULT_MEDIUM))
    parser.add_argument("--checkpoint", required=True, help="Path to HAM10000 checkpoint")
    parser.add_argument("--output-dir", required=True, help="Output folder")
    parser.add_argument("--epochs", type=int, default=16)
    parser.add_argument("--batch-size", type=int, default=24)
    parser.add_argument("--lr", type=float, default=2e-4)
    parser.add_argument("--weight-decay", type=float, default=1e-4)
    parser.add_argument("--label-smoothing", type=float, default=0.05)
    parser.add_argument("--val-split", type=float, default=0.15)
    parser.add_argument("--patience", type=int, default=6)
    parser.add_argument("--min-delta", type=float, default=0.002)
    parser.add_argument("--lr-patience", type=int, default=2)
    parser.add_argument("--lr-factor", type=float, default=0.5)
    args = parser.parse_args()

    data_dirs = [Path(path) for path in args.data_dirs]
    csv_path = Path(args.csv_path)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    high_labels = parse_labels(args.high_labels) or DEFAULT_HIGH
    medium_labels = parse_labels(args.medium_labels) or DEFAULT_MEDIUM

    print("Indexing images...")
    image_index = build_image_index(data_dirs)
    print(f"Indexed {len(image_index)} images.")

    print("Loading metadata...")
    samples = load_metadata(csv_path, image_index, args.label_col, high_labels, medium_labels)
    print(f"Loaded {len(samples)} samples.")

    transform_train = transforms.Compose([
        transforms.Resize((260, 260)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])
    transform_val = transforms.Compose([
        transforms.Resize((260, 260)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])

    val_size = int(len(samples) * args.val_split)
    train_size = len(samples) - val_size
    train_samples, val_samples = random_split(samples, [train_size, val_size])

    train_dataset = PadDataset(train_samples, transform_train)
    val_dataset = PadDataset(val_samples, transform_val)

    print(f"Train size: {len(train_dataset)} | Val size: {len(val_dataset)}")
    train_loader = DataLoader(train_dataset, batch_size=args.batch_size, shuffle=True, num_workers=4)
    val_loader = DataLoader(val_dataset, batch_size=args.batch_size, shuffle=False, num_workers=4)

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Using device: {device}")
    model = build_model(num_classes=3).to(device)
    checkpoint = torch.load(args.checkpoint, map_location=device, weights_only=True)
    classifier_keys = {"classifier.1.weight", "classifier.1.bias"}
    filtered_checkpoint = {
        key: value for key, value in checkpoint.items() if key not in classifier_keys
    }
    missing, unexpected = model.load_state_dict(filtered_checkpoint, strict=False)
    print(
        f"Loaded checkpoint (excluding classifier). Missing: {len(missing)} | "
        f"Unexpected: {len(unexpected)}"
    )

    criterion = nn.CrossEntropyLoss(label_smoothing=args.label_smoothing)
    optimizer = torch.optim.AdamW(
        model.parameters(),
        lr=args.lr,
        weight_decay=args.weight_decay,
    )
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
        optimizer,
        mode="max",
        factor=args.lr_factor,
        patience=args.lr_patience,
        min_lr=1e-6,
    )

    best_val_f1 = 0.0
    epochs_no_improve = 0
    for epoch in range(1, args.epochs + 1):
        train_loss, train_acc = train_one_epoch(model, train_loader, criterion, optimizer, device)
        val_loss, val_acc, val_confusion = evaluate(model, val_loader, criterion, device)
        high_precision, high_recall, high_f1 = high_risk_f1(val_confusion)
        scheduler.step(high_f1)

        print(
            f"Epoch {epoch}/{args.epochs} | "
            f"train_loss={train_loss:.4f} train_acc={train_acc:.4f} | "
            f"val_loss={val_loss:.4f} val_acc={val_acc:.4f} | "
            f"high_precision={high_precision:.4f} high_recall={high_recall:.4f} "
            f"high_f1={high_f1:.4f}"
        )
        print("Confusion matrix (rows=actual, cols=pred):")
        print(val_confusion.cpu().numpy())

        if high_f1 > best_val_f1 + args.min_delta:
            best_val_f1 = high_f1
            epochs_no_improve = 0
            checkpoint_path = output_dir / "efficientnet_b2_pad_ufes_best.pth"
            torch.save(model.state_dict(), checkpoint_path)
        else:
            epochs_no_improve += 1

        if epochs_no_improve >= args.patience:
            print(
                f"Early stopping: no high_f1 improvement >= {args.min_delta} "
                f"for {args.patience} epochs."
            )
            break

    final_path = output_dir / "efficientnet_b2_pad_ufes_last.pth"
    torch.save(model.state_dict(), final_path)


if __name__ == "__main__":
    main()
