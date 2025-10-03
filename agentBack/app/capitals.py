# app/capitals.py
from openai import AzureOpenAI
import os
from dotenv import load_dotenv
import re

load_dotenv()

endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
key = os.getenv("AZURE_OPENAI_KEY")
deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT")

# Validate environment variables
if not all([endpoint, key, deployment]):
    missing = [var for var, val in [
        ("AZURE_OPENAI_ENDPOINT", endpoint),
        ("AZURE_OPENAI_KEY", key),
        ("AZURE_OPENAI_DEPLOYMENT", deployment)
    ] if not val]
    raise ValueError(f"Missing required environment variables: {', '.join(missing)}")

client = AzureOpenAI(
    azure_endpoint=endpoint,
    api_key=key,
    api_version="2024-02-01"
)

def is_capital_related_question(country: str) -> bool:
    """
    Check if the input seems to be asking about a capital city.
    This is a simple validation - you can make it more sophisticated.
    """
    # List of non-country inputs that should be rejected
    non_countries = [
        'what', 'how', 'why', 'when', 'where', 'who',
        'hello', 'hi', 'help', 'thanks', 'thank you',
        'weather', 'time', 'date', 'math', 'calculate',
        'recipe', 'food', 'movie', 'music', 'sports',
        'programming', 'code', 'python', 'javascript',
        'joke', 'story', 'poem', 'song'
    ]
    
    country_lower = country.lower().strip()
    
    # Check if it's clearly not a country name
    if any(word in country_lower for word in non_countries):
        return False
    
    # Check for question words at the beginning
    if re.match(r'^(what|how|why|when|where|who|can you|tell me|explain)', country_lower):
        return False
    
    # Check for mathematical expressions
    if re.search(r'[\+\-\*\/\=\d]+', country_lower) and len(re.findall(r'[a-zA-Z]', country_lower)) < 3:
        return False
    
    # If it passes basic checks, assume it might be a country
    return True

def get_capital(country: str) -> str:
    """
    Get the capital city of a country using Azure OpenAI.
    Only answers capital-related questions.
    """
    try:
        # Clean and validate input
        country = country.strip()
        if not country:
            raise ValueError("Please provide a country name.")
        
        # Check if this seems like a capital-related question
        if not is_capital_related_question(country):
            raise ValueError("I can only answer questions about capital cities of countries. Please provide a country name.")
        
        print(f"🌍 Looking up capital for: {country}")
        
        response = client.chat.completions.create(
            model=deployment,
            messages=[
                {
                    "role": "system", 
                    "content": """You are a geography assistant that ONLY answers questions about capital cities of countries.

STRICT RULES:
1. If the user asks about a country's capital, respond with ONLY the capital city name.
2. If the user asks anything else (math, weather, recipes, jokes, general questions, etc.), respond with exactly: "INVALID_QUESTION"
3. If the country doesn't exist, respond with "UNKNOWN_COUNTRY"

Examples of VALID questions:
- "USA" → "Washington D.C."
- "France" → "Paris"
- "Kenya" → "Nairobi"
- "Brazil" → "Brasília"

Examples of INVALID questions:
- "What is 2+2?" → "INVALID_QUESTION"
- "Tell me a joke" → "INVALID_QUESTION"
- "How are you?" → "INVALID_QUESTION"
- "What's the weather?" → "INVALID_QUESTION"
- "Recipe for pizza" → "INVALID_QUESTION"

Examples of unknown countries:
- "Atlantis" → "UNKNOWN_COUNTRY"
- "Made up country" → "UNKNOWN_COUNTRY"
                    """
                },
                {
                    "role": "user", 
                    "content": f"{country}"
                }
            ],
            max_tokens=50,
            temperature=0.1
        )
        
        capital = response.choices[0].message.content.strip()
        print(f"✅ AI Response: {capital}")
        
        # Handle AI responses
        if capital.upper() == 'INVALID_QUESTION':
            raise ValueError("I can only answer questions about capital cities of countries. Please ask about a country's capital.")
        elif capital.upper() == 'UNKNOWN_COUNTRY':
            raise ValueError(f"'{country}' is not a recognized country. Please provide a valid country name.")
        elif 'unknown' in capital.lower() or 'invalid' in capital.lower():
            raise ValueError(f"I cannot find the capital for '{country}'. Please check the country name and try again.")
        
        return capital
        
    except Exception as e:
        print(f"❌ Error in get_capital: {str(e)}")
        
        # Handle specific Azure OpenAI errors
        error_str = str(e).lower()
        if "401" in error_str or "unauthorized" in error_str:
            raise Exception("Azure OpenAI authentication failed. Please check your API key and endpoint.")
        elif "404" in error_str:
            raise Exception("Azure OpenAI deployment not found. Please check your deployment name.")
        elif "rate limit" in error_str:
            raise Exception("Azure OpenAI rate limit exceeded. Please try again later.")
        elif isinstance(e, ValueError):
            raise e
        else:
            raise Exception(f"Azure OpenAI API error: {str(e)}")