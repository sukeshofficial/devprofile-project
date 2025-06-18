from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/")
async def read_root():
    return {"Hello": "World"}

@app.get("/test")
async def test_endpoint():
    return {"status": "ok", "message": "Test endpoint is working on port 8080"}

if __name__ == "__main__":
    print("Starting FastAPI server on http://localhost:8080")
    print("Test endpoint: http://localhost:8080/test")
    uvicorn.run(app, host="0.0.0.0", port=8080)
