import requests
from dotenv import load_dotenv
import os
from pathlib import Path

env_path = Path(__file__).resolve().parent.parent.parent / ".env"

# Load environment variables
load_dotenv(dotenv_path=env_path)

VIRUSTOTAL_X_API_KEY = os.getenv("VIRUSTOTAL_X_API_KEY")
VIRUSTOTAL_SCAN_URL = "https://www.virustotal.com/api/v3/urls"

def api_call_virustotal(scan_url):
    # scan Url
    payload = { "url": scan_url }
    headers = {
        "accept": "application/json",
        "x-apikey": VIRUSTOTAL_X_API_KEY,
        "content-type": "application/x-www-form-urlencoded"
    }

    response = requests.post(VIRUSTOTAL_SCAN_URL, data=payload, headers=headers)

    REPORT_URL = response.json()['data']['links']['self']  # Fetch link to get reoprt 
    
    # get url report 
   
    headers = {
        "accept": "application/json",
        "x-apikey": VIRUSTOTAL_X_API_KEY
    }

    res = requests.get(REPORT_URL, headers=headers)
    
    return res.json()
    

def api_call_sucuri(scan_url):
    SUCURI_URL = f"https://sitecheck.sucuri.net/api/v3/?scan={scan_url}"  
    
    r = requests.get(SUCURI_URL)
    
    return r.json()


def get_site_data(url):
    result = []
    
    result.append(api_call_virustotal(url))
    result.append(api_call_sucuri(url))
    
    return result
    

