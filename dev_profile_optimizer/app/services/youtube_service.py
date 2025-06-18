import os
import requests
from typing import List, Dict, Any, Optional
import logging
from fastapi import HTTPException
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class YouTubeService:
    API_BASE = "https://www.googleapis.com/youtube/v3"
    
    def __init__(self):
        self.api_key = os.getenv("YOUTUBE_API_KEY")
        if not self.api_key:
            logger.warning("YouTube API key not configured. YouTube features will be disabled.")
    
    def search_videos(self, query: str, max_results: int = 5, language: str = 'en') -> List[Dict[str, Any]]:
        """
        Search for YouTube videos based on a query
        
        Args:
            query: Search query (e.g., "Python programming tutorial")
            max_results: Maximum number of results to return (default: 5)
            language: Language code (e.g., 'en', 'es', 'fr')
            
        Returns:
            List of video objects with id, title, description, thumbnail, duration, and view count
        """
        if not self.api_key:
            return []
            
        try:
            # First, search for videos
            search_url = f"{self.API_BASE}/search"
            search_params = {
                'part': 'snippet',
                'q': query,
                'type': 'video',
                'maxResults': max_results,
                'key': self.api_key,
                'relevanceLanguage': language,
                'videoDuration': 'medium',
                'videoEmbeddable': 'true',
                'videoCaption': 'closedCaption',
                'safeSearch': 'moderate',
                'topicId': '/m/01k8wb'  # Knowledge
            }
            
            # Get video search results
            search_response = requests.get(search_url, params=search_params)
            search_response.raise_for_status()
            search_data = search_response.json()
            
            if not search_data.get('items'):
                return []
            
            # Extract video IDs for the second API call
            video_ids = [item['id']['videoId'] for item in search_data['items']]
            
            # Get video details including duration and view count
            videos_url = f"{self.API_BASE}/videos"
            videos_params = {
                'part': 'contentDetails,statistics',
                'id': ','.join(video_ids),
                'key': self.api_key
            }
            
            videos_response = requests.get(videos_url, params=videos_params)
            videos_response.raise_for_status()
            videos_data = videos_response.json()
            
            # Create a mapping of video_id to video details
            video_details = {item['id']: item for item in videos_data.get('items', [])}
            
            # Combine search results with video details
            videos = []
            for item in search_data['items']:
                video_id = item['id']['videoId']
                snippet = item['snippet']
                details = video_details.get(video_id, {})
                
                # Parse duration from ISO 8601 format (e.g., PT5M30S)
                duration = self._parse_duration(details.get('contentDetails', {}).get('duration', ''))
                
                videos.append({
                    'videoId': video_id,
                    'title': snippet['title'],
                    'description': snippet['description'],
                    'thumbnailUrl': snippet['thumbnails']['high']['url'],
                    'url': f'https://www.youtube.com/watch?v={video_id}',
                    'channelTitle': snippet.get('channelTitle', ''),
                    'publishedAt': snippet.get('publishedAt', ''),
                    'duration': duration,
                    'viewCount': int(details.get('statistics', {}).get('viewCount', 0)) if details.get('statistics', {}).get('viewCount') else 0
                })
                
            return videos
            
        except Exception as e:
            logger.error(f"Error searching YouTube videos: {str(e)}")
            return []
    
    def _parse_duration(self, duration: str) -> str:
        """Parse ISO 8601 duration format to a human-readable format"""
        if not duration:
            return 'N/A'
            
        try:
            # Remove 'PT' prefix
            duration = duration[2:]
            hours = 0
            minutes = 0
            seconds = 0
            
            # Parse hours
            if 'H' in duration:
                hours_part, duration = duration.split('H')
                hours = int(hours_part)
            
            # Parse minutes
            if 'M' in duration:
                minutes_part, duration = duration.split('M')
                minutes = int(minutes_part)
            
            # Parse seconds
            if 'S' in duration:
                seconds_part = duration.replace('S', '')
                if seconds_part:  # Check if there are seconds
                    seconds = int(seconds_part)
            
            # Format as HH:MM:SS or MM:SS
            if hours > 0:
                return f"{hours}:{minutes:02d}:{seconds:02d}"
            else:
                return f"{minutes}:{seconds:02d}"
                
        except Exception as e:
            logger.error(f"Error parsing duration {duration}: {str(e)}")
            return 'N/A'
    
    def get_learning_resources(self, skills: List[str], max_results: int = 3, language: str = 'en', skill_level: str = 'beginner') -> Dict[str, List[Dict[str, str]]]:
        """
        Get learning resources for a list of skills
        
        Args:
            skills: List of skills to find resources for
            max_results: Maximum number of videos per skill
            language: Language code for video search (e.g., 'en', 'es', 'fr')
            skill_level: Skill level for video search (e.g., 'beginner', 'intermediate', 'advanced')
            
        Returns:
            Dictionary mapping skills to their video resources
        """
        resources = {}
        for skill in skills:
            videos = self.search_videos(f"{skill} {skill_level}", max_results, language)
            resources[skill] = videos
            
        return resources
