from github import Github
import requests

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
