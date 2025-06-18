from fastapi import FastAPI, HTTPException, UploadFile, File, Query, Request, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import os
from pathlib import Path
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse, PlainTextResponse, RedirectResponse
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.encoders import jsonable_encoder
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, HttpUrl, Field
import requests
import logging
import os
import shutil
import uvicorn
from pathlib import Path
from datetime import datetime

# Import services
from app.services.github_service import GitHubService
from app.services.job_service import JobService
from app.services.job_analyzer import JobAnalyzer
from app.services.youtube_service import YouTubeService

# Import routers
from app.api.endpoints import readiness_router, job_analyzer_router, profile_router

# Request/Response Models
class SkillRecommendation(BaseModel):
    skill: str
    resources: List[Dict[str, str]]

class LearningResourcesRequest(BaseModel):
    skill: Optional[str] = None
    skills: Optional[List[str]] = None
    maxResults: Optional[int] = 5
    language: Optional[str] = 'en'

class LearningScheduleItem(BaseModel):
    week: int = Field(..., description="Week number")
    skills: List[str] = Field(..., description="Skills to focus on this week")
    hours_per_week: int = Field(..., description="Planned hours for this week")
    focus_area: str = Field(..., description="Main focus area for this week")

class LearningScheduleResponse(BaseModel):
    schedule: List[LearningScheduleItem] = Field(..., description="List of weekly learning plans")
    total_weeks: int = Field(..., description="Total number of weeks in the schedule")
    total_skills: int = Field(..., description="Total number of skills to learn")

class SkillMatchRequest(BaseModel):
    user_skills: List[str]
    job_skills: List[str]

class SkillMatchResponse(BaseModel):
    user_skills: List[str]
    job_skills: List[str]
    missing_skills: List[Dict[str, Any]]
    match_percentage: int
    matching_skills: List[str]
    total_skills: int

class ProfileRequest(BaseModel):
    profile_url: HttpUrl
    

    
class YouTubeSearchRequest(BaseModel):
    query: str
    max_results: int = 5

class ProfileSkillsResponse(BaseModel):
    source: str
    skills: List[str] = []

class JobSkillsResponse(BaseModel):
    skills: List[str]
    source: str

class JobMatchRequest(BaseModel):
    job_skills: List[str] = Field(..., description="Skills required for the job")
    user_skills: List[str] = Field(..., description="User's current skills")

class JobMatchResponse(BaseModel):
    match_percentage: int = Field(..., description="Percentage match between job and user skills")
    matching_skills: List[str] = Field(..., description="List of skills that match between job and user")
    missing_skills: List[str] = Field(..., description="List of skills required by job but not in user's skills")
    total_skills: int = Field(..., description="Total number of skills required by the job")

class LearningScheduleRequest(BaseModel):
    skills: List[str] = Field(..., description="List of skills to learn")
    hours_per_week: int = Field(10, description="Hours available per week for learning")

# Get the base directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Dev Profile Optimizer",
    description="API to optimize developer profiles based on job descriptions",
    version="1.0.0"
)

# Configure static files (mounted once at the end of the middleware setup)

@app.get("/test")
async def test_endpoint():
    """Test endpoint to verify server is running"""
    return {"status": "ok", "message": "Server is running"}

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(job_analyzer_router, prefix="/api/job-analyzer", tags=["Job Analyzer"])
app.include_router(profile_router, prefix="/api/profile", tags=["Profile"])
app.include_router(readiness_router, prefix="/api/readiness", tags=["Readiness Score"])

# Initialize services
github_service = GitHubService()
job_service = JobService()
youtube_service = YouTubeService()

# Ensure uploads directory exists
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Configure templates
templates = Jinja2Templates(directory=str(Path(__file__).parent / "templates"))

# Mount static files
app.mount(
    "/static",
    StaticFiles(directory=str(Path(__file__).parent.parent / "static")),
    name="static"
)

# Models moved to the top of the file

@app.post("/get-learning-resources")
async def get_learning_resources_endpoint(payload: LearningResourcesRequest = Body(...)):
    """
    Fetch learning resources (including YouTube videos) for one or more skills.
    Accepts JSON with either 'skill' or 'skills' (list), and optional 'maxResults' and 'language'.
    """
    try:
        max_results = payload.maxResults or 5
        language = payload.language or 'en'
        # Handle single skill
        if payload.skill:
            resources = job_service.get_learning_resources(payload.skill, max_results=max_results, language=language)
            return JSONResponse(content={"skill": payload.skill, "resources": resources})
        # Handle multiple skills
        elif payload.skills:
            all_resources = {}
            for skill in payload.skills:
                resources = job_service.get_learning_resources(skill, max_results=max_results, language=language)
                all_resources[skill] = resources
            return JSONResponse(content={"resources": all_resources})
        else:
            return JSONResponse(content={"error": "No skill(s) provided."}, status_code=400)
    except Exception as e:
        logger.error(f"Error fetching learning resources: {str(e)}")
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.get("/", response_class=HTMLResponse, include_in_schema=False)
async def read_root(request: Request):
    """Serve the main HTML page"""
    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "github_client_id": os.getenv("GITHUB_CLIENT_ID", "")
        }
    )

@app.get("/job-analyzer", response_class=HTMLResponse, include_in_schema=False)
async def job_analyzer_page(request: Request):
    """Serve the job analyzer page"""
    return templates.TemplateResponse("job_analyzer.html", {"request": request})

@app.get("/privacy", response_class=HTMLResponse, include_in_schema=False)
async def privacy_policy(request: Request):
    """Serve the privacy policy page"""
    return templates.TemplateResponse("privacy.html", {"request": request})

@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Dev Profile Optimizer"}

# OAuth routes
@app.get("/github/auth")
async def github_auth(redirect_uri: str = Query(..., description="Redirect URI after authentication")):
    """Initiate GitHub OAuth flow"""
    github_service = GitHubService()
    return {"url": github_service.get_authorization_url(redirect_uri)}

@app.get("/github/callback")
async def github_callback(code: str, redirect_uri: str):
    """GitHub OAuth callback"""
    try:
        github_service = GitHubService()
        access_token = await github_service.get_access_token(code, redirect_uri)
        return {"access_token": access_token}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/youtube/search", tags=["YouTube"])
async def search_youtube_videos(request: YouTubeSearchRequest):
    """
    Search for YouTube videos based on a query
    
    Args:
        query: Search query
        max_results: Maximum number of results to return (default: 5)
        
    Returns:
        List of relevant YouTube videos
    """
    try:
        videos = youtube_service.search_videos(request.query, request.max_results)
        return {"videos": videos}
    except Exception as e:
        logger.error(f"Error searching YouTube: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to search YouTube: {str(e)}"
        )

@app.get("/api/skills/learning-resources", tags=["Learning"])
async def get_learning_resources(
    skills: str = Query(..., description="Comma-separated list of skills"),
    max_results: int = Query(3, description="Max videos per skill"),
    language: str = Query('en', description="Language code (e.g., 'en', 'es', 'fr')"),
    skill_level: str = Query('beginner', description="Skill level (beginner, intermediate, advanced)")
):
    """
    Get learning resources for a list of skills
    
    Args:
        skills: Comma-separated list of skills
        max_results: Maximum number of videos per skill (default: 3)
        language: Language code (e.g., 'en', 'es', 'fr')
        skill_level: Skill level (beginner, intermediate, advanced)
        
    Returns:
        Dictionary mapping skills to their video resources
    """
    try:
        skill_list = [s.strip() for s in skills.split(",") if s.strip()]
        resources = youtube_service.get_learning_resources(
            skill_list, 
            max_results=max_results,
            language=language,
            skill_level=skill_level
        )
        return {"resources": resources}
    except Exception as e:
        logger.error(f"Error getting learning resources: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get learning resources: {str(e)}"
        )

# Skill extraction routes
@app.get("/extract-github-skills", response_model=ProfileSkillsResponse, tags=["Skills"])
async def extract_github_skills(username: str = Query(..., description="GitHub username")):
    """Extract skills from a GitHub user's public profile"""
    logger.info(f"Received request to extract GitHub skills for user: {username}")
    
    if not username or not username.strip():
        error_msg = "GitHub username cannot be empty"
        logger.error(error_msg)
        raise HTTPException(status_code=400, detail=error_msg)
    
    try:
        # For public access without OAuth (limited to public data)
        url = f"https://api.github.com/users/{username}/repos"
        headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "DevProfileOptimizer/1.0"  # GitHub requires a user-agent
        }
        
        logger.info(f"Making request to GitHub API: {url}")
        response = requests.get(url, headers=headers, timeout=10)
        logger.info(f"GitHub API response status: {response.status_code}")
        
        # Check rate limit headers
        rate_limit_remaining = response.headers.get('X-RateLimit-Remaining')
        rate_limit_reset = response.headers.get('X-RateLimit-Reset')
        logger.info(f"GitHub rate limit - Remaining: {rate_limit_remaining}, Reset: {rate_limit_reset}")
        
        response.raise_for_status()
        repos = response.json()
        logger.info(f"Found {len(repos)} repositories for user {username}")
        
        # Extract skills from repositories
        skills = set()
        for repo in repos:
            if repo.get('language'):
                skills.add(repo['language'].lower())
            if repo.get('topics'):
                skills.update(t.lower() for t in repo['topics'])
        
        logger.info(f"Extracted {len(skills)} skills from GitHub profile")
        return {"source": f"github.com/{username}", "skills": list(skills)}
        
    except requests.exceptions.HTTPError as e:
        status_code = e.response.status_code if hasattr(e, 'response') else 500
        detail = "GitHub API error"
        
        if status_code == 403:
            rate_limit_reset = e.response.headers.get('X-RateLimit-Reset', 'unknown')
            detail = f"GitHub API rate limit exceeded. Please try again later. (Resets at: {rate_limit_reset})"
        elif status_code == 404:
            detail = "GitHub user not found. Please check the username and try again."
        elif status_code == 401:
            detail = "GitHub API authentication failed. Please check your credentials."
        
        logger.error(f"GitHub API error (Status {status_code}): {str(e)}\nResponse: {e.response.text if hasattr(e, 'response') else 'No response'}")
        raise HTTPException(status_code=status_code, detail=detail)
        
    except requests.exceptions.RequestException as e:
        error_msg = f"Failed to connect to GitHub API: {str(e)}"
        logger.error(error_msg)
        raise HTTPException(status_code=503, detail=error_msg)
        
    except Exception as e:
        error_msg = f"Unexpected error extracting GitHub skills: {str(e)}"
        logger.error(error_msg, exc_info=True)
        raise HTTPException(status_code=500, detail=error_msg)

@app.post("/extract-job-skills", response_model=JobSkillsResponse, tags=["Jobs"])
async def process_job_description(
    text: Optional[str] = None, 
    image: Optional[UploadFile] = File(None)
):
    """Process job description (text or image) and extract skills"""
    try:
        job_service = JobService()
        
        if image:
            # Save uploaded file
            file_path = UPLOAD_DIR / image.filename
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)
                
            # Extract text from image
            if str(file_path).lower().endswith('.pdf'):
                text = job_service.extract_text_from_pdf(str(file_path))
            elif str(file_path).lower().endswith(('.docx', '.doc')):
                text = job_service.extract_text_from_docx(str(file_path))
            elif str(file_path).lower().endswith('.txt'):
                text = job_service.extract_text_from_txt(str(file_path))
            else:
                raise HTTPException(status_code=400, detail="Unsupported file format")
                
            # Clean up the file
            file_path.unlink()
            
        if text:
            # Extract skills from text
            skills = job_service.extract_skills_from_text(text)
            return {"skills": skills, "source": "job_description"}
        else:
            raise HTTPException(status_code=400, detail="Either text or image must be provided")
    except Exception as e:
        logger.error(f"Error processing job description: {str(e)}")
        if 'file_path' in locals() and file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/compare-skills", response_model=SkillMatchResponse, tags=["Matching"])
async def compare_skills(request: SkillMatchRequest):
    """Compare user skills with job requirements and get learning resources"""
    try:
        job_service = JobService()
        match_result = job_service.calculate_job_match(
            job_skills=request.job_skills,
            user_skills=request.user_skills
        )
        
        # Get learning resources for missing skills
        missing_skills = []
        for skill in match_result['missing_skills']:
            resources = await get_recommendations(skill)
            missing_skills.append({"skill": skill, "resources": resources})
        
        return {
            "user_skills": request.user_skills,
            "job_skills": request.job_skills,
            "missing_skills": missing_skills,
            "match_percentage": match_result['match_percentage'],
            "matching_skills": match_result['matching_skills'],
            "total_skills": match_result['total_skills']
        }
    except Exception as e:
        logger.error(f"Error comparing skills: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/job-match", response_model=JobMatchResponse, tags=["Matching"])
async def get_job_match(request: JobMatchRequest):
    """
    Calculate job match percentage and get matching details
    
    Returns:
        Dictionary with match percentage, matching skills, and missing skills
    """
    try:
        job_service = JobService()
        return job_service.calculate_job_match(
            job_skills=request.job_skills,
            user_skills=request.user_skills
        )
    except Exception as e:
        logger.error(f"Error calculating job match: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/learning-schedule", response_model=LearningScheduleResponse, tags=["Learning"])
async def get_learning_schedule(request: LearningScheduleRequest):
    """
    Generate a personalized learning schedule
    
    Args:
        skills: List of skills to learn
        hours_per_week: Hours available per week for learning
        
    Returns:
        List of weekly learning plans
    """
    try:
        job_service = JobService()
        return job_service.generate_learning_schedule(
            skills=request.skills,
            hours_per_week=request.hours_per_week
        )
    except Exception as e:
        logger.error(f"Error generating learning schedule: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/recommendations/{skill}", response_model=SkillRecommendation, tags=["Learning"])
async def get_recommendations(skill: str):
    """Get learning recommendations for a specific skill"""
    try:
        resources = JobService.get_learning_resources(skill)
        return {"skill": skill, "resources": resources}
    except Exception as e:
        logger.error(f"Error getting recommendations: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get recommendations: {str(e)}"
        )

# Ensure uploads directory exists
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@app.post("/api/analyze-job-offer")
async def analyze_job_offer(
    file: UploadFile = File(...)
):
    """
    Analyze a job offer document (PDF/DOCX/TXT) and return skills with learning resources
    """
    file_path = None
    try:
        # Save uploaded file
        file_extension = os.path.splitext(file.filename)[1].lower()
        if file_extension not in ['.pdf', '.docx', '.doc', '.txt']:
            raise HTTPException(status_code=400, detail="Unsupported file type. Please upload a PDF, DOCX, DOC, or TXT file.")
        
        # Create unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"job_offer_{timestamp}{file_extension}"
        file_path = UPLOAD_DIR / filename
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Analyze job offer
        analyzer = JobAnalyzer()
        result = analyzer.analyze_job_offer(str(file_path))
        
        # Clean up
        os.remove(file_path)
        
        return JSONResponse(content=result)
        
    except HTTPException as he:
        logger.error(f"HTTP error analyzing job offer: {he.detail}")
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
        raise he
        
    except Exception as e:
        logger.error(f"Error analyzing job offer: {e}", exc_info=True)
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze job offer: {str(e)}"
        )
