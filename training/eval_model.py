import argparse
import csv
from pathlib import Path
from typing import List, Optional

import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Dataset
from torchvision import models, transforms
from PIL import Image
import numpy as np

try:
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    import seaborn as sns
    HAS_PLOT = True
except ImportError:
    HAS_PLOT = False
    print("Install matplotlib and seaborn for visual confusion matrix:")
    print("  pip install matplotlib seaborn")

DEFAULT_HIGH = {"MEL", "SCC", "SEK"}
DEFAULT_MEDIUM = {"BCC", "ACK"}
CLASS_NAMES = ["Low Risk", "Medium Risk", "High Risk"]


def parse_labels(value: Optional[str]) -> set:
    if not value:
        return set()
    return {item.strip().upper() for item in value.split(",") if item.strip()}


def build_image_index(image_dirs: List[Path]) -> dict:
    index = {}
    for directory in image_dirs:
        if not directory.exists():
            continue
        for path in directory.rglob("*"):
            if path.is_file() and path.suffix.lower() in {".png", ".jpg", ".jpeg"}:
                index[path.name] = path
    return index


def load_all_samples(csv_path, image_index, label_col, high_labels, medium_labels):
    samples = []
    with csv_path.open("r", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            image_id = row.get("img_id")
            label_raw = row.get(label_col)
            if not image_id or not label_raw:
                continue
            image_path = image_index.get(image_id)
            if not image_path:
                continue
            label = label_raw.strip().upper()
            if label in high_labels:
                risk = 2
            elif label in medium_labels:
                risk = 1
            else:
                risk = 0
            samples.append((image_path, risk))
    return samples


class SimpleDataset(Dataset):
    def __init__(self, samples, transform):
        self.samples = samples
        self.transform = transform

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        path, label = self.samples[idx]
        image = Image.open(path).convert("RGB")
        image = self.transform(image)
        return image, label


def build_model(num_classes=3):
    base = models.efficientnet_b2(weights=None)
    in_features = base.classifier[1].in_features
    base.classifier[1] = nn.Linear(in_features, num_classes)
    return base


def main():
    parser = argparse.ArgumentParser(description="Evaluate model and plot confusion matrix")
    parser.add_argument("--checkpoint", required=True, help="Path to .pth model")
    parser.add_argument("--data-dirs", nargs="+", required=True, help="Image folders")
    parser.add_argument("--csv-path", required=True, help="Metadata CSV")
    parser.add_argument("--label-col", default="diagnostic")
    parser.add_argument("--high-labels", default=",".join(DEFAULT_HIGH))
    parser.add_argument("--medium-labels", default=",".join(DEFAULT_MEDIUM))
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--output", default="confusion_matrix.png", help="Output image path")
    args = parser.parse_args()

    high_labels = parse_labels(args.high_labels) or DEFAULT_HIGH
    medium_labels = parse_labels(args.medium_labels) or DEFAULT_MEDIUM

    print("Indexing images...")
    image_index = build_image_index([Path(p) for p in args.data_dirs])
    print(f"Indexed {len(image_index)} images.")

    print("Loading metadata...")
    samples = load_all_samples(
        Path(args.csv_path), image_index, args.label_col, high_labels, medium_labels
    )
    print(f"Total samples: {len(samples)}")

    # Count per class
    counts = [0, 0, 0]
    for _, lbl in samples:
        counts[lbl] += 1
    for i, name in enumerate(CLASS_NAMES):
        print(f"  {name}: {counts[i]}")

    transform = transforms.Compose([
        transforms.Resize((260, 260)),
        transforms.CenterCrop((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])

    dataset = SimpleDataset(samples, transform)
    loader = DataLoader(dataset, batch_size=args.batch_size, shuffle=False, num_workers=4)

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Device: {device}")

    model = build_model(num_classes=3).to(device)

    # Load checkpoint (handle different formats)
    raw = torch.load(args.checkpoint, map_location=device, weights_only=False)
    if isinstance(raw, dict) and "model_state_dict" in raw:
        state_dict = raw["model_state_dict"]
    elif isinstance(raw, dict) and "state_dict" in raw:
        state_dict = raw["state_dict"]
    elif isinstance(raw, dict):
        state_dict = raw
    else:
        state_dict = raw.state_dict()

    # Strip 'backbone.' prefix if present
    cleaned = {}
    for k, v in state_dict.items():
        new_key = k.replace("backbone.", "") if k.startswith("backbone.") else k
        cleaned[new_key] = v

    model.load_state_dict(cleaned, strict=False)
    model.eval()
    print("Model loaded.\n")

    # Evaluate
    all_preds = []
    all_labels = []
    correct = 0
    total = 0

    with torch.no_grad():
        for images, labels in loader:
            images = images.to(device)
            labels = labels.to(device)
            outputs = model(images)
            preds = outputs.argmax(dim=1)
            correct += (preds == labels).sum().item()
            total += labels.size(0)
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())

    all_preds = np.array(all_preds)
    all_labels = np.array(all_labels)
    accuracy = correct / total

    # Build confusion matrix
    num_classes = 3
    cm = np.zeros((num_classes, num_classes), dtype=int)
    for t, p in zip(all_labels, all_preds):
        cm[t, p] += 1

    # Per-class metrics
    print("=" * 60)
    print(f"Overall Accuracy: {accuracy * 100:.2f}%  ({correct}/{total})")
    print("=" * 60)
    print(f"\n{'Class':<15} {'Precision':>10} {'Recall':>10} {'F1':>10} {'Support':>10}")
    print("-" * 60)
    for i, name in enumerate(CLASS_NAMES):
        tp = cm[i, i]
        fp = cm[:, i].sum() - tp
        fn = cm[i, :].sum() - tp
        prec = tp / (tp + fp) if (tp + fp) else 0
        rec = tp / (tp + fn) if (tp + fn) else 0
        f1 = 2 * prec * rec / (prec + rec) if (prec + rec) else 0
        support = cm[i, :].sum()
        print(f"{name:<15} {prec:>10.4f} {rec:>10.4f} {f1:>10.4f} {support:>10d}")

    print(f"\nConfusion Matrix (rows=actual, cols=predicted):")
    print(f"{'':>15}", end="")
    for name in CLASS_NAMES:
        print(f"{name:>15}", end="")
    print()
    for i, name in enumerate(CLASS_NAMES):
        print(f"{name:>15}", end="")
        for j in range(num_classes):
            print(f"{cm[i, j]:>15d}", end="")
        print()

    # Plot
    if HAS_PLOT:
        fig, axes = plt.subplots(1, 2, figsize=(16, 6))

        # Raw counts
        sns.heatmap(
            cm, annot=True, fmt="d", cmap="Blues",
            xticklabels=CLASS_NAMES, yticklabels=CLASS_NAMES,
            ax=axes[0], cbar_kws={"label": "Count"}
        )
        axes[0].set_xlabel("Predicted", fontsize=12)
        axes[0].set_ylabel("Actual", fontsize=12)
        axes[0].set_title(f"Confusion Matrix (Counts)\nAccuracy: {accuracy * 100:.2f}%", fontsize=13)

        # Normalised (percentage per row)
        cm_norm = cm.astype(float)
        row_sums = cm_norm.sum(axis=1, keepdims=True)
        row_sums[row_sums == 0] = 1
        cm_pct = cm_norm / row_sums * 100

        sns.heatmap(
            cm_pct, annot=True, fmt=".1f", cmap="Oranges",
            xticklabels=CLASS_NAMES, yticklabels=CLASS_NAMES,
            ax=axes[1], cbar_kws={"label": "%"}
        )
        axes[1].set_xlabel("Predicted", fontsize=12)
        axes[1].set_ylabel("Actual", fontsize=12)
        axes[1].set_title("Confusion Matrix (% per class)", fontsize=13)

        plt.tight_layout()
        output_path = Path(args.output)
        plt.savefig(output_path, dpi=150)
        print(f"\nConfusion matrix saved to: {output_path.resolve()}")
        plt.close()
    else:
        print("\nInstall matplotlib & seaborn to save a visual confusion matrix.")


if __name__ == "__main__":
    main()