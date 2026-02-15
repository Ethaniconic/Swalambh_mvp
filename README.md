# DermSight

DermSight is a multimodal AI-powered triage system for early skin lesion assessment, combining image analysis with symptom inputs to provide structured guidance for patients and clinicians.

## Features

- **Multimodal Triage**: Analyzes skin images and symptom descriptions for risk assessment.
- **Explainable AI**: Uses EfficientNet-B0 with heatmaps and confidence bands.
- **Safety-Focused**: Flags uncertainty and prioritizes high-risk cases for review.
- **Web Interface**: React-based frontend for easy uploads and reports.
- **API Backend**: FastAPI server with MongoDB for data management.

## Architecture

- **Frontend**: React + Vite (client/)
- **Backend**: FastAPI with CORS support (server/)
- **Database**: MongoDB (via Motor async driver)
- **Models**: EfficientNet-B0 pre-trained on HAM10000, fine-tuned on PAD-UFES-20 (models/)
- **Training**: Jupyter notebooks for pre-training and fine-tuning (training/)

## Datasets

- **Pre-training**: HAM10000 (7-class skin lesion classification)
- **Fine-tuning**: PAD-UFES-20 (multimodal triage with risk levels)

## Model Details

- **Backbone**: EfficientNet-B0
- **Inputs**: 224x224 images + metadata (symptoms like itch, bleed, etc.)
- **Outputs**: Triage levels (Low, Medium, High Risk) with confidence scores

## Setup & Deployment

### Prerequisites

- Python 3.8+
- Node.js 18+
- MongoDB (local or cloud, e.g., MongoDB Atlas)
- PyTorch with CUDA (for training)

### Backend Setup

1. Navigate to server/:
   ```sh
   cd server
   pip install -r requirements.txt
   ```

2. Set environment variables in .env:
   ```
   MONGODB_URI=mongodb://localhost:27017
   MONGODB_DB=dermsight
   UPLOAD_DIR=./uploads
   ```

3. Run the server:
   ```sh
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. Navigate to client/:
   ```sh
   cd client
   npm install
   npm run dev
   ```

2. For production build:
   ```sh
   npm run build
   npm run preview
   ```

### Training (Optional)

- Run pretrain.ipynb for HAM10000 pre-training.
- Run finetune.ipynb for PAD-UFES-20 fine-tuning.
- Models saved to models/ and root.

### Local Full Stack

- Start backend on port 8000.
- Start frontend on port 5173 (dev) or 4173 (preview).
- Ensure CORS allows localhost origins.

### Cloud Deployment

- Backend: Deploy to Azure/AWS/GCP with ASGI server (e.g., Gunicorn + Uvicorn).
- Frontend: Static hosting on Vercel/Netlify/Azure Static Web Apps.
- Models: Upload to server storage; load via paths in code.

## Usage

1. Upload a skin image and describe symptoms via the web app.
2. Receive a triage summary with risk level, confidence, and next steps.
3. For high-risk cases, escalate to clinician review.

## Safety & Disclaimer

DermSight provides early guidance only. Not a substitute for professional medical diagnosis. Always consult a clinician.

## License

[Add license if applicable, e.g., MIT]

## Contributing

[Add contribution guidelines if needed]
