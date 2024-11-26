import fastapi
from fastapi.responses import JSONResponse
from fastapi import HTTPException
from transformers import pipeline
from pydantic import BaseModel
from pyvi import ViTokenizer, ViPosTagger
import torch

from ..services.domain import DomainService
from utils import (
    get_config,
)


router_content = fastapi.APIRouter()

class ContentRequest(BaseModel):
    content: str

# Kiểm tra xem GPU có sẵn không
device = "cuda" if torch.cuda.is_available() else "cpu"

text_classifier = pipeline("text-classification", model="gechim/GenZ-mental-health-toxic-content-classification-large" ,device=device)
config = get_config()

@router_content.post("/api/content_filter")
async def infer_domain_api(request: ContentRequest):
    try:
        content = request.content
        max_sequent_length = config['max_sequent_length']
        if len(content) > max_sequent_length:
            content = content[:max_sequent_length]
        result = text_classifier(content)
        # print(result)
        return JSONResponse(
            status_code=200,
            content={
                "label": 1 if result[0]['label'] == 'LABEL_1' else 0,
                "status": 200
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))