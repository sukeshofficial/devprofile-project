import os
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def test_youtube_api():
    api_key = os.getenv('YOUTUBE_API_KEY')
    
    if not api_key:
        print("Error: YOUTUBE_API_KEY not found in .env file")
        return False
    
    print(f"Using YouTube API Key: {api_key[:5]}...{api_key[-5:]}")
    
    # YouTube Data API v3 endpoint
    url = 'https://www.googleapis.com/youtube/v3/search'
    
    # Parameters for the API request
    params = {
        'part': 'snippet',
        'q': 'Python programming tutorial',
        'type': 'video',
        'maxResults': 3,
        'key': api_key
    }
    
    try:
        print("\nSending request to YouTube API...")
        response = requests.get(url, params=params)
        response.raise_for_status()  # Raise an exception for HTTP errors
        
        data = response.json()
        
        if 'items' not in data or not data['items']:
            print("No videos found. The API key might be invalid or have no quota left.")
            return False
            
        print("\nSuccess! Found videos:")
        for i, item in enumerate(data['items'], 1):
            print(f"\n{i}. {item['snippet']['title']}")
            print(f"   Channel: {item['snippet']['channelTitle']}")
            print(f"   URL: https://www.youtube.com/watch?v={item['id']['videoId']}")
        
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"\nError making request to YouTube API: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Status code: {e.response.status_code}")
            print(f"Response: {e.response.text}")
        return False
    except Exception as e:
        print(f"\nAn unexpected error occurred: {e}")
        return False

if __name__ == "__main__":
    print("Testing YouTube API integration...")
    success = test_youtube_api()
    if not success:
        print("\nTest failed. Please check the following:")
        print("1. Ensure you have a valid YouTube Data API v3 key in your .env file")
        print("2. The API key has sufficient quota (check Google Cloud Console)")
        print("3. The 'YouTube Data API v3' is enabled for your project")
        print("4. Your internet connection is working properly")
