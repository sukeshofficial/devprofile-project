from unittest import result
from fastapi import APIRouter, FastAPI, HTTPException
from pydantic import BaseModel
from services.github_fetch import fetch_github_data

router = APIRouter()

class ProfileFetchRequest(BaseModel):
    username: str
    github_token: str
    
@router.post("/fetch-profile")
def fetch_profile(data: ProfileFetchRequest):
    try:
        result = fetch_github_data(data.username, data.github_token)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=400, # Internal server error
            detail=str(e)
        )
