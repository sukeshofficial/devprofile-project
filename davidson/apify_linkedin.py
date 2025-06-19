import requests
import json
import time
import asyncio
from playwright.async_api import async_playwright, TimeoutError



jobs_data= [
  {
    "category": "Technical",
    "jobs": [
      {
        "title": "Software Engineer",
        "description": "Designs, develops, and maintains software applications and systems.",
        "skills": ["Programming", "Algorithms", "Problem-solving"],
        "example_industries": ["IT", "Finance", "Healthcare"]
      },
      {
        "title": "Data Scientist",
        "description": "Analyzes and interprets complex data to help companies make decisions.",
        "skills": ["Statistics", "Machine Learning", "Python", "Data Visualization"],
        "example_industries": ["Technology", "E-commerce", "Healthcare"]
      },
      {
        "title": "Cybersecurity Analyst",
        "description": "Protects systems and networks from cyber threats and vulnerabilities.",
        "skills": ["Network Security", "Risk Assessment", "Incident Response"],
        "example_industries": ["Banking", "IT", "Government"]
      },
      {
        "title": "Cloud Solutions Architect",
        "description": "Designs and manages scalable cloud computing solutions.",
        "skills": ["Cloud Platforms", "System Design", "DevOps"],
        "example_industries": ["IT", "Telecommunications", "Retail"]
      },
      {
        "title": "Front-End Developer",
        "description": "Builds and maintains the user interface of web applications.",
        "skills": ["HTML", "CSS", "JavaScript", "UI/UX","UI developer","Taiwind CSS"],
        "example_industries": ["Media", "E-commerce", "Education"]
      }
    ]
  },
  {
    "category": "Artificial Intelligence",
    "jobs": [
      {
        "title": "AI Engineer",
        "description": "Develops and deploys artificial intelligence models and solutions for real-world applications.",
        "skills": [
          "Python", "Machine Learning", "Deep Learning", "Data Engineering", "AI Ethics"
        ],
        "example_industries": ["Technology", "Healthcare", "Finance", "Retail"]
      },
      {
        "title": "Machine Learning Engineer",
        "description": "Designs, builds, and maintains machine learning systems and infrastructure.",
        "skills": [
          "Python", "TensorFlow", "PyTorch", "Data Processing", "Model Deployment"
        ],
        "example_industries": ["Technology", "Automotive", "Finance"]
      },
      {
        "title": "Natural Language Processing (NLP) Engineer",
        "description": "Specializes in building systems that understand and generate human language.",
        "skills": [
          "NLP", "Python", "spaCy", "NLTK", "Transformers"
        ],
        "example_industries": ["Tech", "Healthcare", "Customer Service"]
      },
      {
        "title": "Computer Vision Engineer",
        "description": "Develops AI systems that interpret and process visual information from the world.",
        "skills": [
          "Computer Vision", "OpenCV", "Deep Learning", "Image Processing"
        ],
        "example_industries": ["Healthcare", "Retail", "Automotive", "Security"]
      },
      {
        "title": "AI Research Scientist",
        "description": "Advances the field of AI by conducting research and developing new algorithms.",
        "skills": [
          "Research", "Mathematics", "Algorithm Development", "Scientific Writing"
        ],
        "example_industries": ["Academia", "Tech", "R&D"]
      },
      {
        "title": "AI Ethics Officer",
        "description": "Ensures the responsible and ethical development and deployment of AI systems.",
        "skills": [
          "Ethics", "Policy Analysis", "AI Governance", "Risk Assessment"
        ],
        "example_industries": ["Technology", "Government", "Healthcare"]
      }
    ]
  },
  {
    "category": "Non-Technical",
    "jobs": [
      {
        "title": "Project Manager",
        "description": "Plans, executes, and closes projects, ensuring goals are met on time and within budget.",
        "skills": ["Leadership", "Communication", "Organization"],
        "example_industries": ["IT", "Construction", "Healthcare"]
      },
      {
        "title": "Digital Marketing Specialist",
        "description": "Develops and executes online marketing strategies to promote products or services.",
        "skills": ["SEO", "Content Creation", "Social Media"],
        "example_industries": ["Retail", "Media", "Education"]
      },
      {
        "title": "Business Analyst",
        "description": "Analyzes business processes and recommends improvements for efficiency and profitability.",
        "skills": ["Analytical Thinking", "Documentation", "Stakeholder Management"],
        "example_industries": ["Finance", "IT", "Consulting"]
      },
      {
        "title": "Human Resources Manager",
        "description": "Oversees recruitment, training, and employee relations within an organization.",
        "skills": ["Interpersonal Skills", "Conflict Resolution", "Policy Development"],
        "example_industries": ["All industries"]
      },
      {
        "title": "Content Writer",
        "description": "Creates engaging written content for websites, blogs, and marketing materials.",
        "skills": ["Writing", "Research", "Creativity"],
        "example_industries": ["Media", "Marketing", "Education"]
      },
      {
        "title": "Sales Representative",
        "description": "Sells products or services and maintains client relationships.",
        "skills": ["Negotiation", "Customer Service", "Product Knowledge"],
        "example_industries": ["Retail", "Pharmaceuticals", "Technology"]
      }
    ]
  }
]



# ---- CONFIGURATION ----
API_TOKEN = '**************************************************'
user_url=input("Paste your URL here: ")
user_url.replace(" ","-")
input_data = {
    "targetUrls": [
        "https://www.linkedin.com/in/{user_url}}"
    ],
    "maxPosts": 5,
    "scrapeReactions": False,
    "maxReactions": 5,
    "scrapeComments": False,
    "maxComments": 5
}

# Step 1: Start the run
response = requests.post(
    f"https://api.apify.com/v2/acts/harvestapi~linkedin-profile-posts/runs?token={API_TOKEN}",
    headers={'Content-Type': 'application/json'},
    data=json.dumps(input_data)
)
run_info = response.json()
run_id = run_info['data']['id']
print(f"Started run with ID: {run_id}")

# Step 2: Wait for completion
def wait_for_run_to_finish(run_id, api_token, poll_interval=10):
    status = 'RUNNING'
    while status in ['RUNNING', 'READY']:
        resp = requests.get(
            f"https://api.apify.com/v2/actor-runs/{run_id}?token={api_token}"
        )
        data = resp.json()
        status = data['data']['status']
        print(f"Run status: {status}")
        if status == 'SUCCEEDED':
            return data
        elif status in ['FAILED', 'ABORTED', 'TIMED-OUT']:
            raise Exception(f"Run failed with status: {status}")
        time.sleep(poll_interval)
    return None

wait_for_run_to_finish(run_id, API_TOKEN)

# Step 3: Get dataset ID and download posts
run_details = requests.get(
    f"https://api.apify.com/v2/actor-runs/{run_id}?token={API_TOKEN}"
).json()
dataset_id = run_details['data']['defaultDatasetId']


posts_response = requests.get(f"https://api.apify.com/v2/datasets/{dataset_id}/items?token={API_TOKEN}")

posts = posts_response.json()

with open("D:/posts.json", "w", encoding="utf-8") as file:
    json.dump(posts, file, indent=4)

post_text=""
#print("\nActual Post Content:\n" + "-"*30)
for idx, post in enumerate(posts, 1):
    # Try common keys for post text
    post_texts = post.get('text') or post.get('content') or post.get('postContent') or post.get('description')
    post_text+=post_texts

job_options = []
for category in jobs_data:
    for job in category["jobs"]:
        job_options.append({
            "category": category["category"],
            "title": job["title"],
            "description": job["description"],
            "skills": job["skills"]
        })

# --- Prepare prompt as a single string ---
user_posts_text = "\n".join(post_text)
jobs_text = "\n".join(
    [f"{idx+1}. {job['title']} ({job['category']}): {job['description']} [Skills: {', '.join(job['skills'])}]"
     for idx, job in enumerate(job_options)]
)

prompt = f"""
You are a helpful AI career advisor.

A user has written the following posts on LinkedIn:
---
{user_posts_text}
---

Here are some job options:
{jobs_text}

Based on the user's posts, which one job from the list above best matches their interests and skills? 
Reply with just one job category. Just suggest only one job from the above job options.
I don't need any explanation about the used's post and his job role. I jsut need only ony or two word answer that stats only about the job.
"""

# --- Query OpenRouter API with a free model (e.g., Llama-3 8B Instruct) ---
API_URL = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_API_KEY = "******************************************************"

headers = {
    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
    "Content-Type": "application/json",
    "HTTP-Referer": "https://YOUR_DOMAIN_OR_EMAIL",  # Replace with your email or domain (required by OpenRouter)
    "X-Title": "Career Advisor"
}

payload = {
    "model": "meta-llama/llama-3-8b-instruct",  # Free and high quality as of June 2025
    "messages": [
        {"role": "system", "content": "You are a helpful AI career advisor."},
        {"role": "user", "content": prompt}
    ],
    "max_tokens": 200,
    "temperature": 0.2
}

response = requests.post(API_URL, headers=headers, data=json.dumps(payload))
if response.status_code == 200:
    output = response.json()
    if "choices" in output and output["choices"]:
        answer = output["choices"][0]["message"]["content"]
        print("\n=== LLM FINAL RECOMMENDATION ===\n")
        print(answer) ## AI ANSWER  
    else:
        print("\nUnexpected output format:", output)
else:
    print("OpenRouter API error:", response.text)

#PLAYWRIGHT

job_to_search=answer.replace(" ","-")
async def main():
    url = f"https://www.naukri.com/{job_to_search}-jobs-in-india"
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        await page.goto(url)
        job_card_selector = 'div.cust-job-tuple'
        try:
            await page.wait_for_selector(job_card_selector, timeout=20000)
        except TimeoutError:
            print("Selector not found. Saving page for inspection.")
            await page.screenshot(path="naukri_debug.png")
            html = await page.content()
            with open("naukri_debug.html", "w", encoding="utf-8") as f:
                f.write(html)
            return
        job_list=[]
        jobs = await page.query_selector_all(job_card_selector)
        print(f"Found {len(jobs)} jobs.")
        for idx, job in enumerate(jobs, 1):
            title = await job.eval_on_selector('a.title', 'el => el.textContent.trim()') if await job.query_selector('a.title') else ''
            company = await job.eval_on_selector('a.comp-name', 'el => el.textContent.trim()') if await job.query_selector('a.comp-name') else ''
            location = await job.eval_on_selector('span.locWdth', 'el => el.textContent.trim()') if await job.query_selector('span.locWdth') else ''
            experience = await job.eval_on_selector('span.expwdth', 'el => el.textContent.trim()') if await job.query_selector('span.expwdth') else ''
            salary = await job.eval_on_selector('span.sal-wrap span[title]', 'el => el.textContent.trim()') if await job.query_selector('span.sal-wrap span[title]') else ''
            description = await job.eval_on_selector('span.job-desc', 'el => el.textContent.trim()') if await job.query_selector('span.job-desc') else ''
            job_url = await job.eval_on_selector('a.title', 'el => el.href') if await job.query_selector('a.title') else ''
            job_list.append({
                  "Job": idx,
                  "Title": title,
                  "Company": company,
                  "Location": location,
                  "Experience": experience,
                  "Salary": salary,
                  "Description": description,
                  "URL": job_url
            })
            '''
            print(f"\nJob {idx}:")
            print(f"  Title: {title}")
            print(f"  Company: {company}")
            print(f"  Location: {location}")
            print(f"  Experience: {experience}")
            print(f"  Salary: {salary}")
            print(f"  Description: {description}")
            print(f"  URL: {job_url}")
        
            '''
        with open("D:/data_job.json", "w", encoding="utf-8") as file:
            json.dump(job_list, file, indent=4)

        '''
        with open("D:/data_job.json", "r", encoding="utf-8") as file:
            file_job_data = json.load(file)
            print(file_job_data, "\njson file data")
        '''
    await browser.close()  

asyncio.run(main())
