from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.capitals import get_capital
import asyncio
from functools import lru_cache
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Azure OpenAI Capitals API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple in-memory cache to reduce API calls
@lru_cache(maxsize=100)
def get_cached_capital(country: str) -> str:
    """Cache capital lookups to reduce Azure OpenAI API calls"""
    return get_capital(country)

@app.get("/")
def home():
    return {
        "message": "Welcome to Azure OpenAI Capitals API!",
        "endpoints": {
            "capital": "/capital/{country}",
            "health": "/health"
        }
    }

@app.get("/capital/{country}")
async def capital(country: str):
    try:
        logger.info(f"Looking up capital for: {country}")
        
        # Run the potentially slow OpenAI call in a thread pool
        capital_city = await asyncio.get_event_loop().run_in_executor(
            None, get_cached_capital, country
        )
        
        logger.info(f"Found capital: {capital_city}")
        return {
            "country": country,
            "capital": capital_city,
            "source": "Azure OpenAI"
        }
        
    except ValueError as e:
        logger.warning(f"Country not found: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"API error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Service error: {str(e)}")

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "Azure OpenAI Capitals API"}

# Clear cache endpoint (useful for testing)
@app.post("/clear-cache")
def clear_cache():
    get_cached_capital.cache_clear()
    return {"message": "Cache cleared"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)