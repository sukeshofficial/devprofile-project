from fastapi import APIRouter

router = APIRouter(prefix="/resume", tags=["Resume"])

@router.post("/generate")
def generate_resume():
    return {"message": "Resume generation endpoint is working!"}

