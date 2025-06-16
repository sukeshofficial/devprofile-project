from github import Github
import requests
import os
from dotenv import load_dotenv

load_dotenv()

def fetch_github_profile(username: str, token: str):
    headers = {"Authorization": f"token {token}"}
    try:
        user_res = requests.get(f"https://api.github.com/users/{username}", headers=headers)
        repos_res = requests.get(f"https://api.github.com/users/{username}/repos", headers=headers)

        user_res.raise_for_status()
        repos_res.raise_for_status()

        user_data = user_res.json()
        repos_data = repos_res.json()

        return {
            "name": user_data.get("name"),
            "bio": user_data.get("bio"),
            "public_repos": user_data.get("public_repos"),
            "followers": user_data.get("followers"),
            "following": user_data.get("following"),
            "avatar_url": user_data.get("avatar_url"),
            "repos": [repo["name"] for repo in repos_data]
        }
    except Exception as e:
        print(f"🔥 Error in fetch_github_profile(): {e}")
        raise

async def extract_and_analyze_repos(username, token, repos):
    headers = {"Authorization": f"token {token}"}
    collected_text = ""

    for repo in repos:
        url = f"https://api.github.com/repos/{username}/{repo}/readme"
        res = requests.get(url, headers=headers)
        if res.status_code == 200:
            content = res.json().get("content", "")
            collected_text += content + "\n\n"

    # Send to OpenRouter
    prompt = f"Extract relevant technical skills from the following repository content:\n{collected_text}"

    openrouter_headers = {
        "Authorization": f"Bearer {os.getenv("OPENROUTER_API_KEY")}",  # 🔁 Replace this
        "Content-Type": "application/json"
    }

    payload = {
        "model": "deepseek/deepseek-r1-0528-qwen3-8b:free",  # You can change this to any supported model
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }

    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers=openrouter_headers,
        json=payload
    )

    if response.status_code == 200:
        return response.json()["choices"][0]["message"]["content"]
    else:
        return f"❌ Error from OpenRouter: {response.status_code} {response.text}"