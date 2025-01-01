import requests
from dotenv import load_dotenv
import os
from pathlib import Path
import subprocess
import time
import threading
from queue import Queue, Empty


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
    

def parse_nikto_output(url, raw_output):
    findings = []
    
    for line in raw_output.splitlines():
        line = line.strip()

        # Extract meaningful findings
        if line.startswith("+") and not line.startswith("+-"):
            findings.append(line[2:])  # Remove "+ " prefix
            
        elif line.startswith("") and not line.startswith("-"):
            findings.append(line)
            
    formatted_output = {
        "url": url,
        "findings": [{"details": finding} for finding in findings],
    }
    return formatted_output
  

def enqueue_output(pipe, queue):
    """Reads lines from the process pipe and puts them in the queue."""
    for line in iter(pipe.readline, ""):
        queue.put(line)
    pipe.close()
    

def call_nikto(scan_url):

    command = ["perl", "nikto/program/nikto.pl", "-h", str(scan_url)] 
    start_time = time.time()

    process = subprocess.Popen(
        command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
    )

    # Queues to store output
    stdout_queue = Queue()
    stderr_queue = Queue()

    # Start threads to read stdout and stderr
    stdout_thread = threading.Thread(target=enqueue_output, args=(process.stdout, stdout_queue))
    stderr_thread = threading.Thread(target=enqueue_output, args=(process.stderr, stderr_queue))

    stdout_thread.start()
    stderr_thread.start()

    output = []
    errors = []

    try:
        while True:
            elapsed_time = time.time() - start_time
            if elapsed_time > timeout:
                process.kill()
                print("**********************************")
                print(elapsed_time)
                print("**********************************")
                raise TimeoutError(f"Nikto scan timed out after {timeout} seconds.")

            # Collect output without blocking
            try:
                while True:
                    line = stdout_queue.get_nowait()
                    output.append(line.strip())
            except Empty:
                pass

            # Collect errors without blocking
            try:
                while True:
                    error_line = stderr_queue.get_nowait()
                    errors.append(error_line.strip())
            except Empty:
                pass

            # Check if process has terminated
            if process.poll() is not None:
                break

            time.sleep(0.1)  # Small sleep to avoid busy-waiting

        # Ensure all remaining output is read
        stdout_thread.join(timeout=1)
        stderr_thread.join(timeout=1)

        return {
            "output": "\n".join(output),
            "errors": "\n".join(errors),
        }

    except TimeoutError as e:
        return {"output": "\n".join(output), "errors": f"Timed out: {e}"}
    except Exception as e:
        print(f"Error occurred: {e}")
        return {"output": "\n".join(output), "errors": f"Error occurred: {e}"}
    
    
def get_site_data(url):
    result = []
    
    result.append(api_call_virustotal(url))
    
    result.append(api_call_sucuri(url))
    
    return result


def get_nikto_data(url):
    parsed_nikto = parse_nikto_output(url, call_nikto(url, timeout=500)["output"])
        
    return parsed_nikto

"""    
async def get_site_data(url):
    result = []
    
    result.append(api_call_virustotal(url))
    
    result.append(api_call_sucuri(url))
    
    result.append(parse_nikto_output(url, call_nikto(url, timeout=300)['output']))

    return result
    
# 
"""

