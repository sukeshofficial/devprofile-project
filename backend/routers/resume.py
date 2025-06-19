from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from utils.latex_resume import generate_pdf_resume_latex
import io

router = APIRouter()

class ResumeData(BaseModel):
    name: str
    role: str
    email: str
    phone: str
    linkedin: str
    github: str
    tech: dict  # languages, ai, frameworks, tools
    achievements: list[str]
    projects: list[dict]  # title, link, points[]
    experience: list[dict]  # company, description
    education: list[dict]  # year, institution, score

@router.post("/generate-resume")
def generate_resume(data: ResumeData):
    pdf_bytes = generate_pdf_resume_latex(data.dict())
    return StreamingResponse(io.BytesIO(pdf_bytes), media_type="application/pdf", headers={
        "Content-Disposition": "attachment; filename=resume.pdf"
    })
