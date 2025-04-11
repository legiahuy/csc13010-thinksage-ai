import json
import requests
from dotenv import load_dotenv
import os
from urllib.parse import quote

# Load environment variables
load_dotenv()

# Define parameters
keyword = "covid 19"
springer_key = os.getenv("SPRINGER_API_KEY")

if not springer_key:
    raise ValueError("SPRINGER_API_KEY is not set in environment variables.")

base_url = "https://api.springernature.com/meta/v2/json"

# Correctly encode only spaces
query = f"keyword: {keyword}"
encoded_query = quote(query)  # Ensures proper encoding: "keyword%3A%20potassium"

# Manually construct the full URL to prevent double encoding
full_url = f"{base_url}?api_key={springer_key}&q={encoded_query}&s=1&p=20"

# Request data from Springer Nature API
try:
    response = requests.get(full_url)  # Use manually constructed URL
    response.raise_for_status()  # Raise an error for HTTP errors
    data = response.json()
except requests.exceptions.RequestException as e:
    print(f"Error fetching data: {e}")
    exit(1)

# Ensure output directory exists
os.makedirs("./data", exist_ok=True)

# Save JSON response
json_path = "./data/test.json"
md_path = "./data/test.md"

with open(json_path, "w") as jsonfile:
    json.dump(data, jsonfile, indent=4)

# Write titles and abstracts to Markdown file
with open(md_path, "w", encoding="utf-8") as mdfile:
    for record in data.get("records", []):  # Handle missing 'records' key
        title = record.get("title", "No Title")
        abstract = record.get("abstract", "No Abstract")
        mdfile.write(f"## {title}\n\n{abstract}\n\n")

print(f"Data saved to {json_path} and {md_path}")
