from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from main import crawl_topic  # Đảm bảo crawl_topic không phải là __main__
from pydantic import BaseModel

app = FastAPI()

# Cho phép gọi từ bất kỳ frontend nào (localhost:3000 chẳng hạn)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Hoặc ["http://localhost:3000"] cho bảo mật hơn
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CrawlRequest(BaseModel):
    topic: str

@app.post("/crawl")
def crawl(req: CrawlRequest):
    result = crawl_topic(req.topic)
    if result['status'] == 'success':
        data = result.get("data", {})
        return {
            "relevant_content": data.get("relevant_content", ""),
            "sources": data.get("sources", []),
        }
    else:
        return {"error": "Crawl failed"}