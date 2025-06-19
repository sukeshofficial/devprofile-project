import spacy
from typing import List, Dict, Any
import logging
import re

logger = logging.getLogger(__name__)

class JobService:
    def __init__(self):
        # Load English language model
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            # If the model is not found, download it
            import subprocess
            import sys
            subprocess.check_call([sys.executable, "-m", "spacy", "download", "en_core_web_sm"])
            self.nlp = spacy.load("en_core_web_sm")
    
    def extract_skills_from_text(self, text: str) -> List[str]:
        """Extract skills from job description text using NLP"""
        # Common technical skills to look for
        common_skills = {
            'python', 'javascript', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'swift', 'kotlin',
            'django', 'flask', 'fastapi', 'react', 'angular', 'vue', 'node', 'express', 'spring',
            'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'git', 'sql', 'nosql', 'mongodb',
            'postgresql', 'mysql', 'redis', 'graphql', 'rest', 'api', 'microservices', 'tensorflow',
            'pytorch', 'machine learning', 'ai', 'data science', 'big data', 'devops', 'ci/cd'
        }
        
        # Convert to lowercase for case-insensitive matching
        text_lower = text.lower()
        
        # Find exact matches of common skills
        found_skills = set()
        for skill in common_skills:
            # Use regex to find whole word matches
            if re.search(r'\b' + re.escape(skill) + r'\b', text_lower):
                found_skills.add(skill)
        
        # Use spaCy to find noun phrases that might be skills
        doc = self.nlp(text)
        for chunk in doc.noun_chunks:
            chunk_text = chunk.text.lower().strip()
            if chunk_text in common_skills and chunk_text not in found_skills:
                found_skills.add(chunk_text)
        
        return sorted(list(found_skills))
    
    def calculate_job_match(self, job_skills: List[str], user_skills: List[str]) -> Dict[str, Any]:
        """
        Calculate job match percentage and missing skills
        
        Args:
            job_skills: List of skills required for the job
            user_skills: List of user's skills
            
        Returns:
            Dictionary with match percentage and missing skills
        """
        if not job_skills:
            return {
                'match_percentage': 0,
                'missing_skills': [],
                'matching_skills': []
            }
            
        # Convert to sets for easier comparison
        job_skills_set = set(skill.lower() for skill in job_skills)
        user_skills_set = set(skill.lower() for skill in user_skills)
        
        # Find matching and missing skills
        matching_skills = list(job_skills_set.intersection(user_skills_set))
        missing_skills = list(job_skills_set - user_skills_set)
        
        # Calculate match percentage
        match_percentage = int((len(matching_skills) / len(job_skills_set)) * 100)
        
        return {
            'match_percentage': match_percentage,
            'missing_skills': missing_skills,
            'matching_skills': matching_skills,
            'total_skills': len(job_skills_set)
        }
        
    def generate_learning_schedule(self, skills: List[str], hours_per_week: int = 10) -> Dict[str, Any]:
        """
        Generate a learning schedule for the given skills
        
        Args:
            skills: List of skills to learn
            hours_per_week: Number of hours per week available for learning
            
        Returns:
            Dictionary containing the learning schedule with the following structure:
            {
                'schedule': List[Dict],  # Weekly learning plans
                'total_weeks': int,      # Total number of weeks in the schedule
                'total_skills': int      # Total number of skills to learn
            }
        """
        if not skills:
            return {
                'schedule': [],
                'total_weeks': 0,
                'total_skills': 0
            }
            
        # Define estimated hours per skill (this can be adjusted based on skill complexity)
        hours_per_skill = 8  # Average hours to learn a skill
        
        # Calculate total hours needed
        total_hours = len(skills) * hours_per_skill
        
        # Calculate number of weeks needed
        weeks_needed = max(1, round(total_hours / hours_per_week))
        
        # Distribute skills across weeks
        skills_per_week = max(1, len(skills) // weeks_needed)
        
        schedule = []
        for week in range(1, weeks_needed + 1):
            start_idx = (week - 1) * skills_per_week
            end_idx = week * skills_per_week
            week_skills = skills[start_idx:end_idx]
            
            if not week_skills and schedule:
                # Distribute remaining skills
                for i, skill in enumerate(skills[start_idx:], 1):
                    schedule[i % len(schedule)]['skills'].append(skill)
                break
                
            schedule.append({
                'week': week,
                'skills': week_skills,
                'hours_per_week': hours_per_week,
                'focus_area': ', '.join(week_skills[:3]) + ('...' if len(week_skills) > 3 else '')
            })
        
        # Update total_weeks in case we distributed skills to fewer weeks
        total_weeks = len(schedule)
        
        return {
            'schedule': schedule,
            'total_weeks': total_weeks,
            'total_skills': len(skills)
        }

    def extract_skills_from_image(self, image_path: str) -> List[str]:
        """Extract text from image using OCR and then extract skills"""
        try:
            import pytesseract
            from PIL import Image
            
            # Open the image file
            image = Image.open(image_path)
            
            # Use pytesseract to extract text
            text = pytesseract.image_to_string(image)
            
            # Extract skills from the text
            return self.extract_skills_from_text(text)
            
        except ImportError:
            logger.error("Pillow or pytesseract not installed. Please install them using: pip install Pillow pytesseract")
            raise ImportError("OCR dependencies not installed. Please install Pillow and pytesseract.")
        except Exception as e:
            logger.error(f"Error processing image: {str(e)}")
            raise Exception(f"Failed to process image: {str(e)}")
    
    def fetch_youtube_videos(self, skill: str, max_results: int = 5, language: str = 'en') -> list:
        """
        Fetch YouTube videos for a skill using the YouTube Data API.
        Returns a list of dicts with title, url, thumbnail, channel, publishedAt, viewCount.
        """
        api_key = os.getenv('YOUTUBE_API_KEY')
        if not api_key:
            return []
        search_url = 'https://www.googleapis.com/youtube/v3/search'
        video_url = 'https://www.googleapis.com/youtube/v3/videos'
        params = {
            'part': 'snippet',
            'q': f'learn {skill} tutorial',
            'type': 'video',
            'maxResults': max_results,
            'relevanceLanguage': language,
            'key': api_key
        }
        try:
            print(f'[YouTube API] Search URL: {search_url}')
            print(f'[YouTube API] Search Params: {params}')
            search_resp = requests.get(search_url, params=params)
            print(f'[YouTube API] Search Response Status: {search_resp.status_code}')
            print(f'[YouTube API] Search Response Body: {search_resp.text}')
            search_resp.raise_for_status()
            search_data = search_resp.json()
            video_ids = [item['id']['videoId'] for item in search_data.get('items', [])]
            print(f'[YouTube API] Video IDs found: {video_ids}')
            if not video_ids:
                print('[YouTube API] No video IDs found for skill:', skill)
                return []
            details_params = {
                'part': 'snippet,statistics',
                'id': ','.join(video_ids),
                'key': api_key
            }
            print(f'[YouTube API] Details URL: {video_url}')
            print(f'[YouTube API] Details Params: {details_params}')
            details_resp = requests.get(video_url, params=details_params)
            print(f'[YouTube API] Details Response Status: {details_resp.status_code}')
            print(f'[YouTube API] Details Response Body: {details_resp.text}')
            details_resp.raise_for_status()
            details_data = details_resp.json()
            videos = []
            for item in details_data.get('items', []):
                snippet = item['snippet']
                stats = item.get('statistics', {})
                videos.append({
                    'title': snippet['title'],
                    'url': f'https://www.youtube.com/watch?v={item["id"]}',
                    'thumbnail': snippet['thumbnails']['high']['url'],
                    'channel': snippet['channelTitle'],
                    'publishedAt': snippet['publishedAt'],
                    'viewCount': stats.get('viewCount', None),
                    'type': 'video',
                    'source': 'YouTube',
                    'description': snippet.get('description', '')
                })
            print(f'[YouTube API] Videos returned: {len(videos)}')
            return videos
        except Exception as e:
            print(f'[YouTube API ERROR]: {e}')
            import traceback; traceback.print_exc()
            return []

    def get_learning_resources(self, skill: str, max_results: int = 5, language: str = 'en') -> list:
        """Get learning resources for a specific skill, including YouTube videos if possible."""
        # Try to fetch real YouTube videos
        videos = self.fetch_youtube_videos(skill, max_results=max_results, language=language)
        resources = []
        if videos:
            resources.extend(videos)
        # Add fallback resources
        resources.extend([
            {
                "title": f"{skill.capitalize()} Documentation",
                "url": f"https://www.google.com/search?q={skill.replace(' ', '+')}+documentation",
                "type": "documentation"
            },
            {
                "title": f"{skill.capitalize()} Projects for Practice",
                "url": f"https://www.google.com/search?q={skill.replace(' ', '+')}+projects+for+beginners",
                "type": "practice"
            }
        ])
        return resources
