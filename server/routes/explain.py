from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Optional
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/explain", tags=["explain"])

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY not set in .env file")

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "llama-3.3-70b-versatile"


class ExplainRequest(BaseModel):
    prediction: str
    risk_level: int
    confidence: float
    scores: Dict[str, float]
    recommendation: Dict[str, object]
    symptoms_used: Dict[str, object]
    user_symptoms: Optional[str] = ""


SYSTEM_PROMPT = """You are DermSight AI — a friendly, medically-informed skin health assistant.

You will receive a JSON triage report from a skin lesion classifier. Your job is to:
1. Explain the result in simple, reassuring language a non-medical person can understand.
2. Describe what the risk level means and why it was assigned.
3. Summarise the recommended next steps clearly.
4. If symptoms were flagged, explain why they matter.
5. Add a short disclaimer that this is AI guidance, not a medical diagnosis.

Keep the tone warm, clear, and calm. Use bullet points where helpful.
Do NOT invent medical facts. Do NOT name a specific disease unless the report does.
Keep the response under 300 words."""


@router.post("")
async def explain_report(req: ExplainRequest):
    report_text = f"""
Prediction: {req.prediction}
Risk Level: {req.risk_level} (0=Low, 1=Medium, 2=High)
Confidence: {req.confidence}%
Scores: Low={req.scores.get('low_risk',0)}%, Medium={req.scores.get('medium_risk',0)}%, High={req.scores.get('high_risk',0)}%
Recommended Action: {req.recommendation.get('action','')}
Urgency: {req.recommendation.get('urgency','')}
Details: {', '.join(req.recommendation.get('details',[]))}
User Symptoms: {req.user_symptoms or 'None provided'}
Danger Flags: {req.symptoms_used.get('danger_flags',0)}
Itch: {req.symptoms_used.get('itch',False)}, Bleed: {req.symptoms_used.get('bleed',False)}, Grew: {req.symptoms_used.get('grew',False)}, Elevation: {req.symptoms_used.get('elevation',False)}
"""

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Here is the triage report:\n{report_text}\n\nPlease explain this to the patient."},
        ],
        "temperature": 0.4,
        "max_tokens": 512,
    }

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(GROQ_URL, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            explanation = data["choices"][0]["message"]["content"]
            return {"explanation": explanation}
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=502, detail=f"Groq API error: {e.response.status_code} — {e.response.text}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Explanation failed: {str(e)}")