# Developer Profile Optimizer

A powerful tool to analyze your GitHub profile and get personalized learning recommendations. Extract skills from your GitHub repositories and receive YouTube video suggestions to enhance your developer skills.

## Features

- **GitHub Profile Analysis**: Analyze your GitHub repositories to extract skills and activity metrics
- **Personalized Learning Resources**: Get YouTube video recommendations based on your skills
- **Skill Gap Analysis**: Compare your skills with job requirements
- **Job Readiness Score**: Get a percentage score showing how well your skills match a job role
- **Modern Web Interface**: Responsive UI built with Tailwind CSS and Material-UI
- **Cross-Platform Support**: Works on desktop and mobile devices

## Job Readiness Score (JRS)

The Job Readiness Score (JRS) helps you understand how well your skills match a specific job role. It provides a percentage score along with a detailed breakdown of different factors that contribute to the score.

### How It Works

The JRS is calculated using the following weighted formula:

```
Total Score = 
  (Skill Match * 0.4) + 
  (Activity Recency * 0.2) + 
  (Project Count * 0.2) + 
  (Resume Keywords * 0.2)
```

### API Endpoint

```
POST /api/readiness/calculate
```

**Request Body:**
```json
{
  "user_skills": ["Python", "JavaScript", "React"],
  "job_requirements": {
    "languages": ["Python", "JavaScript"],
    "frameworks": ["React", "Django"],
    "tools": ["Git", "Docker"]
  },
  "last_activity": "2023-05-01T00:00:00Z",
  "project_count": 5,
  "resume_keywords": ["Python", "JavaScript", "React"]
}
```

**Response:**
```json
{
  "total_score": 78.5,
  "breakdown": {
    "skill_match": 85.0,
    "activity_recency": 65.0,
    "project_count": 80.0,
    "resume_keywords": 90.0
  }
}
```

## Prerequisites

- Python 3.10+
- Docker (optional)
- Tesseract OCR (for image processing)
- Google API Key (for YouTube integration)

## Installation

### Using Docker (Recommended)

1. Build the Docker image:
   ```bash
   docker build -t dev-profile-optimizer .
   ```
2. Run the container:
   ```bash
   docker run -d --name dev-optimizer -p 8000:8000 dev-profile-optimizer
   ```

### Local Setup
1. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Install Tesseract OCR:
   - Windows: Download and install from [UB Mannheim](https://github.com/UB-Mannheim/tesseract/wiki)
   - macOS: `brew install tesseract`
   - Linux: `sudo apt-get install tesseract-ocr`

## Google API Setup (for YouTube integration)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3
4. Create API credentials (API key)
5. Add the API key to your `.env` file as `YOUTUBE_API_KEY`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `YOUTUBE_API_KEY` | Google API key for YouTube Data API | For YouTube features |
| `SECRET_KEY` | Secret key for session management | No (generated if not provided) |

## Usage

1. Start the server:
   ```bash
   uvicorn app.main:app --reload
   ```
2. Open the API documentation at: http://localhost:8000/docs

### API Endpoints

- `GET /`: Health check
- `POST /extract-skills`: Extract skills from GitHub/LinkedIn URL
- `POST /upload-job`: Process job description (text or image)
- `POST /compare-skills`: Compare user skills with job requirements
- `GET /recommendations`: Get learning recommendations for a skill

## Development

### Running Tests
```bash
pytest tests/
```

### Environment Variables
Create a `.env` file in the root directory with the following variables:
```
GITHUB_TOKEN=your_github_token
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
```

## License
MIT
