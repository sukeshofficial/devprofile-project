import requests
import base64
import os
from dotenv import load_dotenv
load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

async def extract_and_analyze_repos(username, token, repos):
    headers = {"Authorization": f"token {token}"}
    collected_text = ""

    for repo in repos:
        url = f"https://api.github.com/repos/{username}/{repo}/readme"
        res = requests.get(url, headers=headers)
        if res.status_code == 200:
            content = res.json().get("content", "")
            decoded = base64.b64decode(content).decode("utf-8")
            collected_text += decoded + "\n\n"

    if not collected_text.strip():
        return "No README content found."

    prompt = f"Extract the technical skills mentioned in the following repositories:\n\n{collected_text}"

    openrouter_headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": "deepseek/deepseek-r1-0528-qwen3-8b:free",  # or gpt-4, or any other available model
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }

    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers=openrouter_headers,
        json=payload
    )

    try:
        res_json = response.json()
        return res_json["choices"][0]["message"]["content"]
    except Exception as e:
        print("❌ OpenRouter Error:", response.status_code, response.text)
        return "Failed to extract skills. Check server logs for details."
