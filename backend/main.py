from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import github, analyze, resume
from fastapi.staticfiles import StaticFiles

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(github.router)
app.include_router(analyze.router)
app.include_router(resume.router)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def read_root():
    return {"message": "DevProfile Generator API is Running!"}