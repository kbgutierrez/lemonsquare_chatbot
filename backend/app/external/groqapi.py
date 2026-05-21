import os

import requests
from dotenv import load_dotenv


load_dotenv("backend/.env")

url = "https://api.groq.com/openai/v1/models"

headers = {
    "Authorization": f"Bearer {os.getenv('GROQ_API_KEY')}"
}

response = requests.get(url, headers=headers)

print(response.status_code)
print(response.json())