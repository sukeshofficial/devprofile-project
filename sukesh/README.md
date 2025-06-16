# 💼 DevProfile Generator (Backend)

> A FastAPI-based backend that helps developers generate optimized profiles (GitHub, Resume) using intelligent data fetching and analysis.

---

## 🚀 Features

- 🔐 User authentication (Signup/Login)
- 🔑 GitHub Token support for fetching user details
- 📄 Resume and GitHub profile analyzer (WIP)
- 🗂️ SQLite database integration with SQLAlchemy
- 🧠 Ready for AI-based suggestions and GPT integrations

---

## 📁 Project Structure

```
devprofile-project/
└── backend/
    ├── main.py                  # FastAPI app entry point
    ├── models/
    │   └── profile.py           # SQLAlchemy models (User, Profile, etc.)
    ├── routers/
    │   ├── auth.py              # Signup/Login API routes
    │   ├── github.py            # GitHub fetcher routes
    │   └── resume.py            # Resume analyzer routes (placeholder)
    ├── services/
    │   ├── github_fetch.py      # Service to fetch GitHub data
    │   ├── gpt_analyser.py      # GPT-based analysis (future feature)
    │   └── pdf_generator.py     # Resume PDF generator (WIP)
    ├── database.py              # DB setup with SQLite & SQLAlchemy
    ├── .env                     # For secrets like GITHUB_TOKEN
    └── requirements.txt         # Python dependencies
```

---

## 🛠️ Setup Instructions

### 1. 🔧 Clone the Repo
```bash
git clone https://github.com/yourusername/devprofile-project.git
cd devprofile-project/backend
```

### 2. 📦 Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # For Windows: venv\Scripts\activate
```

### 3. 🧪 Install Dependencies
```bash
pip install -r requirements.txt
```

If using `EmailStr`, don’t forget:
```bash
pip install email-validator
```

---

## ⚙️ Run the Backend

```bash
uvicorn main:app --reload
```

Go to 👉 [http://localhost:8000/docs](http://localhost:8000/docs) to use Swagger UI.

---

## 🗃️ Database Info

- Uses **SQLite** as default (easy for development)
- DB file is created as `devprofile.db`
- You can inspect it using [DB Browser for SQLite](https://sqlitebrowser.org/)

---

## 🧪 API Endpoints

### 🔐 Auth Routes
| Method | Endpoint           | Description          |
|--------|--------------------|----------------------|
| POST   | `/auth/signup`     | Register new user    |
| POST   | `/auth/login`      | Login existing user  |

### 🧑‍💻 GitHub Routes
| Method | Endpoint           | Description          |
|--------|--------------------|----------------------|
| POST   | `/github/fetch`    | Fetch GitHub profile using token |

---

## 🧠 Coming Soon

- GPT-powered resume analyzer
- Resume suggestion engine
- Downloadable PDF generator
- LinkedIn and project score fetcher
- Frontend integration (React / Tailwind / Streamlit)

---

## 🧑‍💻 Made with ❤️ by Sukesh

- FastAPI + SQLite + SQLAlchemy + bcrypt
- GPT & Qdrant integrations coming soon!
=======
# 💼 DevProfile Generator (Backend)

> A FastAPI-based backend that helps developers generate optimized profiles (GitHub, Resume) using intelligent data fetching and analysis.

---

## 🚀 Features

- 🔐 User authentication (Signup/Login)
- 🔑 GitHub Token support for fetching user details
- 📄 Resume and GitHub profile analyzer (WIP)
- 🗂️ SQLite database integration with SQLAlchemy
- 🧠 Ready for AI-based suggestions and GPT integrations

---

## 📁 Project Structure

```
devprofile-project/
└── backend/
    ├── main.py                  # FastAPI app entry point
    ├── models/
    │   └── profile.py           # SQLAlchemy models (User, Profile, etc.)
    ├── routers/
    │   ├── auth.py              # Signup/Login API routes
    │   ├── github.py            # GitHub fetcher routes
    │   └── resume.py            # Resume analyzer routes (placeholder)
    ├── services/
    │   ├── github_fetch.py      # Service to fetch GitHub data
    │   ├── gpt_analyser.py      # GPT-based analysis (future feature)
    │   └── pdf_generator.py     # Resume PDF generator (WIP)
    ├── database.py              # DB setup with SQLite & SQLAlchemy
    ├── .env                     # For secrets like GITHUB_TOKEN
    └── requirements.txt         # Python dependencies
```

---

## 🛠️ Setup Instructions

### 1. 🔧 Clone the Repo
```bash
git clone https://github.com/yourusername/devprofile-project.git
cd devprofile-project/backend
```

### 2. 📦 Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # For Windows: venv\Scripts\activate
```

### 3. 🧪 Install Dependencies
```bash
pip install -r requirements.txt
```

If using `EmailStr`, don’t forget:
```bash
pip install email-validator
```

---

## ⚙️ Run the Backend

```bash
uvicorn main:app --reload
```

Go to 👉 [http://localhost:8000/docs](http://localhost:8000/docs) to use Swagger UI.

---

## 🗃️ Database Info

- Uses **SQLite** as default (easy for development)
- DB file is created as `devprofile.db`
- You can inspect it using [DB Browser for SQLite](https://sqlitebrowser.org/)

---

## 🧪 API Endpoints

### 🔐 Auth Routes
| Method | Endpoint           | Description          |
|--------|--------------------|----------------------|
| POST   | `/auth/signup`     | Register new user    |
| POST   | `/auth/login`      | Login existing user  |

### 🧑‍💻 GitHub Routes
| Method | Endpoint           | Description          |
|--------|--------------------|----------------------|
| POST   | `/github/fetch`    | Fetch GitHub profile using token |

---

## 🧠 Coming Soon

- GPT-powered resume analyzer
- Resume suggestion engine
- Downloadable PDF generator
- LinkedIn and project score fetcher
- Frontend integration (React / Tailwind / Streamlit)

---

## 🧑‍💻 Made by Sukesh

- FastAPI + SQLite + SQLAlchemy + bcrypt
- GPT & Qdrant integrations coming soon!
>>>>>>> 05356c770393177decc5b2eed2e4e8280929ddd0
