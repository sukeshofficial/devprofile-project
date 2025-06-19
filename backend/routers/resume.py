from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from utils.latex_resume import generate_pdf_resume_latex
import io
import uuid 
from fastapi.responses import JSONResponse

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
    try:
        pdf_bytes = generate_pdf_resume_latex(data.dict())

        # Save it to a static file (e.g., public/resumes/ folder)
        filename = f"{uuid.uuid4().hex}.pdf"
        path = f"static/resumes/{filename}"
        with open(path, "wb") as f:
            f.write(pdf_bytes)

        return JSONResponse(content={"pdf_url": f"http://localhost:8000/{path}"})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})