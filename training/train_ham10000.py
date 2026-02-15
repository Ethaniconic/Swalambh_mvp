import argparse
import csv
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Tuple

import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Dataset, random_split
from torchvision import models, transforms
from PIL import Image

HAM_LABELS = ["akiec", "bcc", "bkl", "df", "mel", "nv", "vasc"]
LABEL_TO_INDEX = {label: idx for idx, label in enumerate(HAM_LABELS)}


@dataclass
class Sample:
    image_path: Path
    label: int


def find_image_dir(root: Path) -> Path:
    candidates = [
        root / "images",
        root / "HAM10000_images",
        root / "HAM10000_images_part_1",
        root / "HAM10000_images_part_2",
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate
    raise FileNotFoundError("Could not find an images folder inside HAM10000 root.")


def load_metadata(csv_path: Path, image_dir: Path) -> List[Sample]:
    samples: List[Sample] = []
    with csv_path.open("r", newline="") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            image_id = row.get("image_id") or row.get("image")
            label = row.get("dx")
            if not image_id or not label:
                continue
            if label not in LABEL_TO_INDEX:
                continue
            image_path = image_dir / f"{image_id}.jpg"
            if image_path.exists():
                samples.append(Sample(image_path=image_path, label=LABEL_TO_INDEX[label]))
    if not samples:
        raise ValueError("No training samples found. Check CSV columns and image paths.")
    return samples


class HamDataset(Dataset):
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

    return running_loss / total, correct / total


def main():
    parser = argparse.ArgumentParser(description="Finetune EfficientNet-B2 on HAM10000")
    parser.add_argument("--data-root", required=True, help="Path to HAM10000 root folder")
    parser.add_argument("--csv-path", required=True, help="Path to metadata CSV")
    parser.add_argument("--output-dir", required=True, help="Where to save checkpoints")
    parser.add_argument("--epochs", type=int, default=10)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--lr", type=float, default=3e-4)
    parser.add_argument("--val-split", type=float, default=0.15)
    args = parser.parse_args()

    data_root = Path(args.data_root)
    csv_path = Path(args.csv_path)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    print("Loading dataset...")
    image_dir = find_image_dir(data_root)
    samples = load_metadata(csv_path, image_dir)
    print(f"Found {len(samples)} samples in {image_dir}.")

    transform_train = transforms.Compose([
        transforms.Resize((260, 260)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomVerticalFlip(),
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

    train_dataset = HamDataset(train_samples, transform_train)
    val_dataset = HamDataset(val_samples, transform_val)

    print(f"Train size: {len(train_dataset)} | Val size: {len(val_dataset)}")
    train_loader = DataLoader(train_dataset, batch_size=args.batch_size, shuffle=True, num_workers=4)
    val_loader = DataLoader(val_dataset, batch_size=args.batch_size, shuffle=False, num_workers=4)

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Using device: {device}")
    model = build_model(num_classes=len(HAM_LABELS)).to(device)
    print("Model initialized. Starting training...")
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.AdamW(model.parameters(), lr=args.lr)

    best_val_acc = 0.0
    for epoch in range(1, args.epochs + 1):
        train_loss, train_acc = train_one_epoch(model, train_loader, criterion, optimizer, device)
        val_loss, val_acc = evaluate(model, val_loader, criterion, device)

        print(
            f"Epoch {epoch}/{args.epochs} | "
            f"train_loss={train_loss:.4f} train_acc={train_acc:.4f} | "
            f"val_loss={val_loss:.4f} val_acc={val_acc:.4f}"
        )

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            checkpoint_path = output_dir / "efficientnet_b2_ham10000_best.pth"
            torch.save(model.state_dict(), checkpoint_path)

    final_path = output_dir / "efficientnet_b2_ham10000_last.pth"
    torch.save(model.state_dict(), final_path)


if __name__ == "__main__":
    main()
