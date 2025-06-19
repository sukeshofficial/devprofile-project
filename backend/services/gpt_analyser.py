from json import load
import os
import requests
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

def extract_skills_from_readme(readme_text: str) -> list:
    """
    Uses OpenRouter to extract technical skills from README content.
    """
    
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }
    
    prompt = f"""
    You are a resume analyzer. Given this README content, extract a list of technical skills or technologies used in the project. Just return the list of skills.
    
    README:
    {readme_text}
    """
    
    payload = {
        "model": "openai/gpt-3.5-turbo",  # or any other model you want
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }
    
    response = requests.post(url, headers=headers, json=payload)

    if response.status_code == 200:
        result = response.json()
        reply = result["choices"][0]["message"]["content"]
        skills = [skill.strip("-• \n") for skill in reply.split("\n") if skill.strip()]
        return skills
    else:
        return ["Error: Could not fetch from OpenRouter"]