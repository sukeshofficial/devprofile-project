import os
from dotenv import load_dotenv
from app.services.youtube_service import YouTubeService

# Load environment variables
load_dotenv()

def test_youtube_service():
    # Initialize the YouTube service
    youtube = YouTubeService()
    
    # Test search query
    query = "Python programming"
    print(f"Searching for videos about: {query}")
    
    try:
        videos = youtube.search_videos(query, max_results=3)
        if not videos:
            print("No videos found. This could be due to:")
            print("1. No API key in .env file")
            print("2. Invalid API key")
            print("3. API quota exceeded")
            return
            
        print("\nFound videos:")
        for i, video in enumerate(videos, 1):
            print(f"\n{i}. {video['title']}")
            print(f"   URL: {video['url']}")
            
    except Exception as e:
        print(f"Error: {str(e)}")
        print("\nPlease check your internet connection and API key.")

if __name__ == "__main__":
    test_youtube_service()
