
# 💼 DevProfile Generator

> A full-stack AI-powered tool that fetches GitHub profile and repositories, extracts tech skills using GPT, and generates a beautiful LaTeX resume PDF.

---

## 📂 Project Structure

```
DEVPROFILE-GENERATOR/
├── backend/
│   ├── routers/
│   │   ├── analyze.py          # Endpoint to extract skills from selected repos
│   │   ├── github.py           # Endpoint to fetch GitHub profile & repos
│   │   └── resume.py           # Endpoint to generate LaTeX PDF resume
│   ├── services/
│   │   ├── github_fetch.py     # Logic to fetch GitHub profile & repos
│   │   └── gpt_analyser.py     # GPT logic to extract skills from README
│   ├── utils/
│   │   ├── latex_resume.py     # Renders LaTeX template with Jinja2
│   │   └── sukesh_resume_template.tex  # LaTeX resume template
│   ├── static/
│   │   └── resumes/            # Stores generated PDF resumes
│   ├── main.py                 # FastAPI app entry point
│   ├── .env                    # GitHub or GPT API tokens
│   └── requirements.txt        # Python dependencies
│
├── frontend/
│   ├── index.html              # Full one-page UI
│   └── script.js               # JavaScript to handle frontend logic
│
└── README.md                   # Project documentation
```

---

## 🚀 Features

- 🔐 GitHub token-based authentication
- 🧠 GPT-powered skill extraction from repo README
- 📄 LaTeX resume generation (Jinja2 templating)
- 🪄 One-page wizard-style frontend (HTML + Tailwind CSS)
- 📥 Resume download + PDF preview

---

## 🔧 Setup Instructions

### 1. Backend (Python - FastAPI)

#### 📦 Create a virtual environment and install dependencies:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### 🔐 Create `.env` for secrets:

```
GITHUB_TOKEN=your_github_token_here
OPENAI_API_KEY=your_openai_key_here (optional if using GPT)
```

#### 🚀 Run FastAPI server:

```bash
uvicorn main:app --reload
```

---

### 2. Frontend (HTML + JS)

Just open the frontend in browser:

```bash
cd frontend
# You can simply open index.html
```

Or serve it locally with a simple server:

```bash
npx serve .
# or
python -m http.server
```

---

## 📘 API Endpoints

| Route             | Method | Description                       |
|------------------|--------|-----------------------------------|
| `/fetch-profile` | POST   | Get GitHub profile & repo list    |
| `/analyze-repos` | POST   | Extract skills from repo README   |
| `/generate-resume` | POST | Generate and return resume URL    |

---

## 🛠 Technologies Used

- FastAPI
- Jinja2
- LaTeX (MiKTeX)
- Tailwind CSS
- JavaScript
- GitHub API
- OpenAI (optional)

---

## 📄 License

This project is licensed under MIT License.

---

## 👨‍💻 Author

Built by **Sukesh D** 🚀  
GitHub: [@sukeshofficial](https://github.com/sukeshofficial)
