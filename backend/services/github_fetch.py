import requests


def fetch_github_data(username: str, token: str):
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github+json",
    }

    # --------------------- User Profile Endpoint ---------------------

    profile_url = f"https://api.github.com/user"
    profile_resp = requests.get(profile_url, headers=headers)

    if profile_resp.status_code != 200:
        raise Exception("Failed to fetch profile")

    # ------------ Repos endpoint (can paginate later) ----------------

    repos_url = f"https://api.github.com/user/repos"
    repos_resp = requests.get(repos_url, headers=headers)
    if repos_resp.status_code != 200:
        raise Exception("Failed to fetch repositories")
    
    return {
        "profile": profile_resp.json(),
        "repositories": repos_resp.json()
    }