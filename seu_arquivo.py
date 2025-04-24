from fastapi import FastAPI
from pydantic import BaseModel
import requests

app = FastAPI()

class Query(BaseModel):
    prompt: str

@app.post("/chat")
async def chat(query: Query):
    response = requests.post(
        "http://localhost:1234/v1/chat/completions",
        json={
            "messages": [{"role": "user", "content": query.prompt}],
            "temperature": 0.7,
            "stream": False
        }
    )
    return {
        "response": response.json()['choices'][0]['message']['content']
    }

# Para executar:
# uvicorn seu_arquivo:app --reload --port 5000