import requests
from dotenv import load_dotenv
import os
from pathlib import Path
import subprocess
import time

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
    print("response")
    print(response)
    if response.status_code != 200:
        return {}
    
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
    

def parse_nikto_output(url, raw_output):
    findings = []

    if isinstance(raw_output, bytes):
        raw_output = raw_output.decode("utf-8", errors="ignore")
        
    for line in raw_output.splitlines():
        line = line.strip()

        # Extract meaningful findings
        if isinstance(line, str):  # Ensure line is a string
            if line.startswith("+") and not line.startswith("+-"):
                findings.append(line[2:])  # Remove "+ " prefix
            
            elif line.startswith("") and not line.startswith("-"):
                findings.append(line)
            
    formatted_output = {
        "url": url,
        "findings": [{"details": finding} for finding in findings],
    }
    return formatted_output
  
  
def call_nikto_command_with_timeout(scan_url, timeout=60):
    #command = ["/usr/bin/perl", "vendors/Web_Safe_Guard/nikto/program/nikto.pl", "-h", scan_url]
    command = ["perl", "vendors/Web_Safe_Guard/nikto/program/nikto.pl", "-h", scan_url]
    #command = ["vendors/Web_Safe_Guard/perl/perl/bin/perl.exe", "vendors/Web_Safe_Guard/nikto/program/nikto.pl", "-h", scan_url]
    output = None
    
    try:
        # Run the command with a timeout
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=timeout
        )
        output = result.stdout or "" 
     
    except subprocess.TimeoutExpired as e:
        output = e.stdout.decode("utf-8", errors="ignore") if e.stdout else "Timeout expired; partial output not available."
       
    except subprocess.CalledProcessError as e:
        output = e.output.decode("utf-8", errors="ignore") if e.output else f"Error occurred: {e.stderr}"
        
    return output
    
   
def get_site_data(url):
    result = []
    
    result.append(api_call_virustotal(url))
    
    result.append(api_call_sucuri(url))
    
    nikto_data = call_nikto_command_with_timeout(url)
    
    result.append(parse_nikto_output(url, nikto_data))
    
    return result
