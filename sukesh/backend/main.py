from fastapi import FastAPI
from routers import github, resume, analyze
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

# Include API routes
app.include_router(github.router)
app.include_router(resume.router)
app.include_router(analyze.router, prefix="/analyze")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change "*" to ["http://127.0.0.1:5500"] for tighter security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "DevProfile Optimizer Backend Running 🚀"}

