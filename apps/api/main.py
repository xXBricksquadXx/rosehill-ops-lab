from fastapi import FastAPI

app = FastAPI(
    title="Rosehill Ops Lab API",
    version="0.1.0",
    description="Backend for small-ops efficiency: HR / Service / Parts / Delivery & BOL."
)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "rosehill-ops-api",
        "version": "0.1.0",
    }
