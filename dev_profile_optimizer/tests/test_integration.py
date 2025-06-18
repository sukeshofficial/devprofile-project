import os
import pytest
from fastapi.testclient import TestClient
from app.main import app
from unittest.mock import patch, MagicMock

client = TestClient(app)

def test_linkedin_username_extraction():
    """Test LinkedIn username extraction from various URL formats."""
    from app.services.linkedin_service import LinkedInService
    
    test_cases = [
        ("https://www.linkedin.com/in/johndoe", "johndoe"),
        ("http://linkedin.com/in/janesmith", "janesmith"),
        ("www.linkedin.com/pub/foobar", "foobar"),
        ("https://www.linkedin.com/company/acme-corp", "acme-corp"),
        ("invalid-url", None),
        ("", None),
    ]
    
    for url, expected in test_cases:
        assert LinkedInService.extract_username(url) == expected

@patch('app.services.youtube_service.build')
def test_youtube_search(mock_youtube_build):
    """Test YouTube video search functionality."""
    # Mock the YouTube API response
    mock_search = MagicMock()
    mock_search.list.return_value.execute.return_value = {
        'items': [
            {
                'id': {'videoId': 'test123'},
                'snippet': {
                    'title': 'Test Video',
                    'description': 'Test description',
                    'thumbnails': {'high': {'url': 'https://test.com/thumb.jpg'}}
                }
            }
        ]
    }
    mock_youtube_build.return_value.search.return_value = mock_search
    
    # Test the endpoint
    response = client.post(
        "/api/youtube/search",
        json={"query": "python tutorial", "max_results": 1}
    )
    
    assert response.status_code == 200
    assert len(response.json()["videos"]) == 1
    assert response.json()["videos"][0]["title"] == "Test Video"

@patch('app.services.linkedin_service.requests.get')
def test_linkedin_profile_endpoint(mock_get):
    """Test LinkedIn profile endpoint with mock data."""
    # Mock the LinkedIn API response
    mock_response = MagicMock()
    mock_response.json.return_value = {
        'id': 'test123',
        'firstName': 'John',
        'lastName': 'Doe',
        'headline': 'Software Engineer',
        'location': {'name': 'San Francisco, CA'}
    }
    mock_get.return_value = mock_response
    
    # Test the endpoint
    response = client.post(
        "/api/linkedin/profile",
        json={"profile_url": "https://linkedin.com/in/johndoe"},
        params={"access_token": "test-token"}
    )
    
    assert response.status_code == 200
    assert response.json()["profile"]["firstName"] == "John"
    assert response.json()["profile"]["lastName"] == "Doe"

def test_skills_learning_resources():
    """Test skills learning resources endpoint."""
    with patch('app.services.youtube_service.YouTubeService.search_videos') as mock_search:
        mock_search.return_value = [
            {
                'title': 'Python Tutorial',
                'url': 'https://youtube.com/watch?v=test123',
                'thumbnail': 'https://test.com/thumb.jpg',
                'description': 'Learn Python basics'
            }
        ]
        
        response = client.get("/api/skills/learning-resources?skills=python,javascript")
        
        assert response.status_code == 200
        assert "python" in response.json()["resources"]
        assert len(response.json()["resources"]["python"]) > 0

if __name__ == "__main__":
    pytest.main(["-v"])
