import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import numpy as np
import os
from pathlib import Path

# ==========================================
# 1. CONFIGURATION
# ==========================================
DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'
_DEFAULT_MODEL_PATH = Path(__file__).resolve().parents[1] / "models" / "efficientnet_b2_pad_ufes_best.pth"
MODEL_PATH = os.getenv("MODEL_PATH", str(_DEFAULT_MODEL_PATH))

LABELS = {
    0: "Low Risk (Benign)",
    1: "Medium Risk (Pre-cancer / Watch)",
    2: "High Risk (Malignant / Urgent)"
}

RISK_EMOJI = {0: "🟢", 1: "🟡", 2: "🔴"}

RECOMMENDATIONS = {
    0: {
        "action": "Self-monitor at home",
        "details": [
            "Keep the area clean and moisturised",
            "Take photos monthly to track any changes",
            "Use sunscreen SPF 30+ daily",
            "Re-check in 3 months or if symptoms change"
        ],
        "urgency": "No immediate action needed"
    },
    1: {
        "action": "Schedule a dermatology appointment",
        "details": [
            "Book a consultation within 2 weeks",
            "Avoid scratching or irritating the area",
            "Note any changes in size, colour or shape",
            "A biopsy may be recommended"
        ],
        "urgency": "Consult a dermatologist within 2 weeks"
    },
    2: {
        "action": "Seek urgent medical attention",
        "details": [
            "See a dermatologist within 48 hours",
            "Do not delay — early detection saves lives",
            "Avoid sun exposure on the affected area",
            "Bring this report to your appointment"
        ],
        "urgency": "Urgent — see a doctor within 48 hours"
    }
}


# ==========================================
# 2. MODEL ARCHITECTURE
# ==========================================
class DermSightModel(nn.Module):
    def __init__(self):
        super().__init__()
        base = models.efficientnet_b2(weights=None)
        in_features = base.classifier[1].in_features
        base.classifier[1] = nn.Linear(in_features, 3)
        # Expose features and classifier at top level (no wrapper prefix)
        self.features = base.features
        self.avgpool = base.avgpool
        self.classifier = base.classifier

    def forward(self, image):
        x = self.features(image)
        x = self.avgpool(x)
        x = torch.flatten(x, 1)
        x = self.classifier(x)
        return x


# ==========================================
# 3. PREDICTION ENGINE
# ==========================================
class DermSightPredictor:
    def __init__(self, model_path):
        self.device = DEVICE
        print(f"Loading DermSight model on {self.device}...")

        self.model = DermSightModel().to(self.device)

        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model not found: {model_path}")

        raw = torch.load(model_path, map_location=self.device, weights_only=False)

        # Handle different checkpoint formats
        if isinstance(raw, dict) and "model_state_dict" in raw:
            state_dict = raw["model_state_dict"]
        elif isinstance(raw, dict) and "state_dict" in raw:
            state_dict = raw["state_dict"]
        elif isinstance(raw, dict):
            state_dict = raw
        else:
            # torch.save(model, ...) was used — extract state_dict
            state_dict = raw.state_dict()

        # Strip 'backbone.' prefix if present (training saved with wrapper)
        cleaned = {}
        for k, v in state_dict.items():
            new_key = k.replace("backbone.", "") if k.startswith("backbone.") else k
            cleaned[new_key] = v

        # Drop num_batches_tracked if missing in model
        model_keys = set(self.model.state_dict().keys())
        cleaned = {k: v for k, v in cleaned.items() if k in model_keys}

        self.model.load_state_dict(cleaned, strict=False)
        self.model.eval()
        print(f"Model loaded: {model_path} ({len(cleaned)} keys matched)")

        self.transform = transforms.Compose([
            transforms.Resize((260, 260)),
            transforms.CenterCrop((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])

        self.tta_transforms = [
            self.transform,
            transforms.Compose([
                transforms.Resize((260, 260)),
                transforms.CenterCrop((224, 224)),
                transforms.RandomHorizontalFlip(p=1.0),
                transforms.ToTensor(),
                transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
            ]),
            transforms.Compose([
                transforms.Resize((260, 260)),
                transforms.CenterCrop((224, 224)),
                transforms.RandomVerticalFlip(p=1.0),
                transforms.ToTensor(),
                transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
            ]),
        ]

    def predict(self, image_path, itch=False, bleed=False, grew=False, elevation=False):
        try:
            image = Image.open(image_path).convert('RGB')
        except Exception as e:
            return {"error": f"Image load failed: {str(e)}"}

        all_probs = []
        with torch.no_grad():
            for t in self.tta_transforms:
                tensor = t(image).unsqueeze(0).to(self.device)
                logits = self.model(tensor)
                probs = torch.softmax(logits, dim=1).cpu().numpy()[0]
                all_probs.append(probs)

        avg_probs = np.mean(all_probs, axis=0)

        symptom_flags = [itch, bleed, grew, elevation]
        danger_count = sum(symptom_flags)
        if danger_count >= 2:
            avg_probs[2] *= (1.0 + 0.15 * danger_count)
        if bleed and grew:
            avg_probs[2] *= 1.25

        total = avg_probs.sum()
        if total > 0:
            avg_probs = avg_probs / total

        prediction_idx = int(np.argmax(avg_probs))

        if avg_probs[2] > 0.30:
            prediction_idx = 2

        result = {
            "prediction": f"{RISK_EMOJI[prediction_idx]} {LABELS[prediction_idx]}",
            "risk_level": prediction_idx,
            "confidence": round(float(avg_probs[prediction_idx]) * 100, 1),
            "scores": {
                "low_risk": round(float(avg_probs[0]) * 100, 1),
                "medium_risk": round(float(avg_probs[1]) * 100, 1),
                "high_risk": round(float(avg_probs[2]) * 100, 1),
            },
            "recommendation": RECOMMENDATIONS[prediction_idx],
            "symptoms_used": {
                "itch": itch,
                "bleed": bleed,
                "grew": grew,
                "elevation": elevation,
                "danger_flags": danger_count,
            }
        }
        return result


# ==========================================
# 4. SINGLETON HELPER
# ==========================================
_predictor = None


def load_model_and_predict(image_path, itch=False, bleed=False, grew=False, elevation=False, model_path=MODEL_PATH):
    global _predictor
    if _predictor is None:
        _predictor = DermSightPredictor(model_path)
    return _predictor.predict(image_path, itch, bleed, grew, elevation)


# ==========================================
# 5. STANDALONE TEST
# ==========================================
if __name__ == "__main__":
    engine = DermSightPredictor(MODEL_PATH)
    test_image = Path(__file__).resolve().parents[1] / "data" / "PAD_UFES" / "imgs_part_1" / "imgs_part_1" / "PAT_9_13_1.png"
    if test_image.exists():
        r = engine.predict(str(test_image), itch=False, bleed=False, grew=False, elevation=False)
        print(f"Result: {r['prediction']}")
        print(f"Confidence: {r['confidence']}%")
        print(f"Scores: {r['scores']}")
        print(f"Action: {r['recommendation']['action']}")
    else:
        print(f"Test image not found: {test_image}")