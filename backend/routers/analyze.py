from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
from services.gpt_analyser import extract_skills_from_readme

router = APIRouter()

class AnalyzeRequest(BaseModel):
    github_token: str
    selected_repos: list[str]
    
@router.post("/analyze-repos")
def analyze_repos(data: AnalyzeRequest):
    results = []
    
    for repo_name in data.selected_repos:
        readme_url = f"https://api.github.com/repos/{get_username_from_token(data.github_token)}/{repo_name}/readme"
        headers = {
            "Authorization": f"token {data.github_token}",
            "Accept": "application/vnd.github+json"
        }
        
        response = requests.get(readme_url, headers=headers)
        
        if response.status_code == 200:
            readme_data = response.json()
            import base64
            decoded = base64.b64decode(readme_data["content"]).decode("utf-8")
            skills = extract_skills_from_readme(decoded)
            results.append({
                "repo": repo_name,
                "skills": skills,
                "status": "success"
            })
            
        else:
            results.append({
                "repo": repo_name,
                "skills": [],
                "status": "README.md not found"
            })
            
    return {"results": results}

def get_username_from_token(token: str) -> str:
    """Get the username from GitHub token."""
    
    user_resp = requests.get("https://api.github.com/user", headers={
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github+json"
    })

    if user_resp.status_code == 200:
        return user_resp.json()["login"]
    else:
        raise HTTPException(status_code=401, detail="Invalid GitHub token")