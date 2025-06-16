from pydantic import BaseModel
from typing import List
from fastapi import APIRouter
from services.gpt_analyser import extract_and_analyze_repos  # import your function

class AnalyzeRequest(BaseModel):
    username: str
    token: str
    repos: List[str]

router = APIRouter()

@router.post("/skills")
async def analyze_skills(request: AnalyzeRequest):
    skills = await extract_and_analyze_repos(request.username, request.token, request.repos)
    return {"skills": skills}
