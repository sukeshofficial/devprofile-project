from fastapi import APIRouter, Query, HTTPException
from services.github_fetch import fetch_github_profile

router = APIRouter(prefix="/profile", tags=["GitHub Profile"])

@router.get("/github")
def get_github_profile(username: str = Query(...), token: str = Query(...)):
    try:
        return fetch_github_profile(username, token)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"GitHub fetch error: {e}")
