from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel

from app.services.readiness_score_service import ReadinessScoreService

router = APIRouter()
readiness_service = ReadinessScoreService()

class JobRequirements(BaseModel):
    languages: List[str] = []
    frameworks: List[str] = []
    tools: List[str] = []
    databases: List[str] = []
    other_skills: List[str] = []

class ReadinessScoreRequest(BaseModel):
    user_skills: List[str]
    job_requirements: JobRequirements
    last_activity: Optional[datetime] = None
    project_count: int = 0
    resume_keywords: Optional[List[str]] = None

class ScoreBreakdown(BaseModel):
    skill_match: float
    activity_recency: float
    project_count: float
    resume_keywords: Optional[float] = None

class ReadinessScoreResponse(BaseModel):
    total_score: float
    breakdown: ScoreBreakdown

@router.post("/calculate", response_model=ReadinessScoreResponse)
async def calculate_readiness_score(request: ReadinessScoreRequest):
    """
    Calculate Job Readiness Score (JRS) based on various factors
    
    - **user_skills**: List of user's skills
    - **job_requirements**: Required skills categorized by type
    - **last_activity**: Last activity date (optional)
    - **project_count**: Number of completed projects (default: 0)
    - **resume_keywords**: Keywords from resume (optional)
    """
    try:
        # Convert job requirements to flat dict for the service
        job_reqs_dict = {
            'languages': request.job_requirements.languages,
            'frameworks': request.job_requirements.frameworks,
            'tools': request.job_requirements.tools,
            'databases': request.job_requirements.databases,
            'other_skills': request.job_requirements.other_skills
        }
        
        # Calculate the score
        total_score, breakdown = readiness_service.calculate_score(
            user_skills=request.user_skills,
            job_requirements=job_reqs_dict,
            last_activity_date=request.last_activity,
            project_count=request.project_count,
            resume_keywords=request.resume_keywords
        )
        
        # Prepare response
        response = {
            'total_score': total_score,
            'breakdown': {
                'skill_match': breakdown['skill_match'],
                'activity_recency': breakdown['activity_recency'],
                'project_count': breakdown['project_count'],
                'resume_keywords': breakdown.get('resume_keywords')
            }
        }
        
        # Remove resume_keywords if not provided in request
        if request.resume_keywords is None:
            response['breakdown'].pop('resume_keywords', None)
        
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error calculating readiness score: {str(e)}"
        )
