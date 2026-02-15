from pathlib import Path
import uuid
import os

from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from fastapi.responses import JSONResponse

from ..predict import load_model_and_predict

router = APIRouter(prefix="/predict", tags=["predict"])

TEMP_DIR = Path(__file__).resolve().parents[1] / "tmp_uploads"
TEMP_DIR.mkdir(parents=True, exist_ok=True)

ACCEPTED_TYPES = {"image/jpeg", "image/png", "image/jpg"}
MAX_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("")
async def predict_case(
    image: UploadFile = File(...),
    symptoms: str = Form(""),
):
    # Validate type
    if image.content_type not in ACCEPTED_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid file type: {image.content_type}")

    # Read and validate size
    data = await image.read()
    if len(data) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    # Save temp
    file_ext = Path(image.filename or "").suffix.lower() or ".jpg"
    temp_path = TEMP_DIR / f"{uuid.uuid4().hex}{file_ext}"

    try:
        with temp_path.open("wb") as f:
            f.write(data)

        # Parse symptoms string into boolean flags
        sym_lower = symptoms.lower() if symptoms else ""
        itch = any(k in sym_lower for k in ["itch", "itchy", "itching", "pruritus"])
        bleed = any(k in sym_lower for k in ["bleed", "bleeding", "blood"])
        grew = any(k in sym_lower for k in ["grew", "growing", "enlarged", "bigger", "growth", "size increase"])
        elevation = any(k in sym_lower for k in ["elevated", "raised", "bump", "elevation", "lump"])

        result = load_model_and_predict(
            image_path=str(temp_path),
            itch=itch,
            bleed=bleed,
            grew=grew,
            elevation=elevation,
        )

        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])

        return JSONResponse(content=result)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if temp_path.exists():
            try:
                os.remove(temp_path)
            except OSError:
                pass
