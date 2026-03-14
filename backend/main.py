from fastapi import FastAPI

app = FastAPI(title="Vigil Backend")


@app.get("/")
def root():
    return {"message": "Vigil backend is running"}


@app.get("/health")
def health():
    return {"status": "ok"}