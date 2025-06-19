import os
import requests
from typing import List, Dict, Any, Optional
import logging
from fastapi import HTTPException
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class GitHubService:
    BASE_URL = "https://api.github.com"
    CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
    CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")
    
    def __init__(self):
        if not self.CLIENT_ID or not self.CLIENT_SECRET:
            logger.warning("GitHub OAuth credentials not found in environment variables")
    
    def _get_auth_headers(self, token: Optional[str] = None) -> dict:
        """Get headers with authentication"""
        headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "DevProfileOptimizer/1.0"
        }
        if token:
            headers["Authorization"] = f"token {token}"
        return headers
    
    def get_oauth_url(self, redirect_uri: str) -> str:
        """Generate GitHub OAuth URL"""
        return (
            f"https://github.com/login/oauth/authorize"
            f"?client_id={self.CLIENT_ID}"
            f"&redirect_uri={redirect_uri}"
            "&scope=repo,user"
        )
    
    async def get_access_token(self, code: str, redirect_uri: str) -> str:
        """Exchange code for access token"""
        try:
            response = requests.post(
                "https://github.com/login/oauth/access_token",
                headers={"Accept": "application/json"},
                data={
                    "client_id": self.CLIENT_ID,
                    "client_secret": self.CLIENT_SECRET,
                    "code": code,
                    "redirect_uri": redirect_uri
                }
            )
            response.raise_for_status()
            data = response.json()
            return data.get("access_token")
        except Exception as e:
            logger.error(f"Error getting GitHub access token: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Failed to authenticate with GitHub: {str(e)}")
    
    async def get_user_repos(self, token: str) -> List[Dict[str, Any]]:
        """Fetch all repositories for the authenticated user"""
        try:
            url = f"{self.BASE_URL}/user/repos"
            headers = self._get_auth_headers(token)
            
            repos = []
            page = 1
            while True:
                response = requests.get(
                    url,
                    headers=headers,
                    params={
                        "per_page": 100,
                        "page": page,
                        "sort": "updated",
                        "direction": "desc"
                    }
                )
                response.raise_for_status()
                
                page_repos = response.json()
                if not page_repos:
                    break
                    
                repos.extend(page_repos)
                page += 1
                
                # GitHub API has a limit of 1000 results
                if len(page_repos) < 100 or len(repos) >= 1000:
                    break
                    
            return repos
            
        except Exception as e:
            logger.error(f"Error fetching GitHub repos: {str(e)}")
            raise HTTPException(status_code=400, detail=f"GitHub API error: {str(e)}")
    
    @staticmethod
    def extract_skills_from_repos(repos: List[Dict[str, Any]]) -> List[str]:
        """Extract skills from repository languages and topics"""
        skills = set()
        
        # Common technical skills to look for
        common_skills = {
            'python', 'javascript', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'swift', 'kotlin',
            'django', 'flask', 'fastapi', 'react', 'angular', 'vue', 'node', 'express', 'spring',
            'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'git', 'sql', 'nosql', 'mongodb',
            'postgresql', 'mysql', 'redis', 'graphql', 'rest', 'api', 'microservices', 'tensorflow',
            'pytorch', 'machine learning', 'ai', 'data science', 'big data', 'devops', 'ci/cd'
        }
        
        for repo in repos:
            # Add repository language if it exists
            if repo.get('language') and repo['language'].lower() in common_skills:
                skills.add(repo['language'].lower())
            
            # Add repository topics
            topics = repo.get('topics', [])
            for topic in topics:
                if topic.lower() in common_skills:
                    skills.add(topic.lower())
            
            # Parse description for skills
            if repo.get('description'):
                description = repo['description'].lower()
                for skill in common_skills:
                    if skill.lower() in description:
                        skills.add(skill.lower())
        
        return sorted(list(skills))
    
    async def get_skills(self, token: str) -> List[str]:
        """Get all skills from the authenticated user's GitHub profile"""
        repos = await self.get_user_repos(token)
        return self.extract_skills_from_repos(repos)
