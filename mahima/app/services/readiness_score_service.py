from typing import Dict, List, Optional, Tuple
from datetime import datetime, timezone
import logging
import math

logger = logging.getLogger(__name__)

class ReadinessScoreService:
    def __init__(self):
        # Weights for different components of the score (sums to 1.0)
        self.weights = {
            'skill_match': 0.4,      # 40% weight for skill matching
            'activity_recency': 0.2, # 20% for recent GitHub activity
            'project_count': 0.2,    # 20% for number of completed projects
            'resume_keywords': 0.2   # 20% for resume keyword matching
        }
        
    def calculate_score(
        self,
        user_skills: List[str],
        job_requirements: Dict[str, List[str]],
        last_activity_date: Optional[datetime] = None,
        project_count: int = 0,
        resume_keywords: List[str] = None
    ) -> Tuple[float, Dict[str, float]]:
        """
        Calculate the Job Readiness Score (JRS)
        
        Args:
            user_skills: List of user's skills
            job_requirements: Dictionary of job requirements by category
                             e.g., {'languages': ['Python', 'JavaScript'], 'frameworks': ['React', 'Django']}
            last_activity_date: Date of last GitHub activity
            project_count: Number of completed projects
            resume_keywords: List of keywords found in resume (if uploaded)
            
        Returns:
            Tuple of (total_score, breakdown) where breakdown contains individual component scores
        """
        # Calculate skill match score
        skill_match = self._calculate_skill_match(user_skills, job_requirements)
        
        # Calculate activity recency score
        activity_score = self._calculate_activity_score(last_activity_date) if last_activity_date else 0.0
        
        # Calculate project count score (normalized to 0-1 range, max 10 projects)
        project_score = min(project_count / 10.0, 1.0)
        
        # Calculate resume keyword match score
        resume_score = self._calculate_resume_score(resume_keywords, job_requirements) if resume_keywords else 0.0
        
        # Calculate weighted total
        total_score = (
            skill_match * self.weights['skill_match'] +
            activity_score * self.weights['activity_recency'] +
            project_score * self.weights['project_count'] +
            resume_score * self.weights['resume_keywords']
        )
        
        # Create breakdown of scores
        breakdown = {
            'skill_match': round(skill_match * 100, 1),
            'activity_recency': round(activity_score * 100, 1),
            'project_count': round(project_score * 100, 1),
            'resume_keywords': round(resume_score * 100, 1) if resume_keywords is not None else None
        }
        
        return round(total_score * 100, 1), breakdown
    
    def _calculate_skill_match(self, user_skills: List[str], job_requirements: Dict[str, List[str]]) -> float:
        """Calculate skill match score (0-1)"""
        if not job_requirements:
            return 0.0
            
        # Flatten all required skills
        required_skills = []
        for category in job_requirements.values():
            required_skills.extend([s.lower() for s in category])
            
        if not required_skills:
            return 0.0
            
        # Calculate match percentage
        user_skills_lower = [s.lower() for s in user_skills]
        matched_skills = [s for s in required_skills if s in user_skills_lower]
        
        return len(matched_skills) / len(required_skills)
    
    def _calculate_activity_score(self, last_activity: datetime) -> float:
        """Calculate activity recency score (0-1)"""
        if not last_activity:
            return 0.0
            
        now = datetime.now(timezone.utc)
        days_since_activity = (now - last_activity).days
        
        # Score decreases over time, with half-life of 30 days
        # Score = 1.0 for activity today, ~0.5 after 30 days, ~0.25 after 60 days, etc.
        half_life = 30  # days
        score = 0.5 ** (days_since_activity / half_life)
        
        return min(max(score, 0.0), 1.0)
    
    def _calculate_resume_score(self, resume_keywords: List[str], job_requirements: Dict[str, List[str]]) -> float:
        """Calculate resume keyword match score (0-1)"""
        if not resume_keywords or not job_requirements:
            return 0.0
            
        # Flatten all required skills and convert to lowercase for case-insensitive matching
        required_skills = set()
        for category in job_requirements.values():
            required_skills.update(s.lower() for s in category)
            
        if not required_skills:
            return 0.0
            
        # Convert resume keywords to lowercase for case-insensitive matching
        resume_keywords_lower = [k.lower() for k in resume_keywords]
        
        # Calculate match percentage
        matched_keywords = [k for k in resume_keywords_lower if k in required_skills]
        
        return len(matched_keywords) / len(required_skills)
