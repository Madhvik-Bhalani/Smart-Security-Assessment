import requests
from bs4 import BeautifulSoup
import tldextract

CLIENT_SLIDE_STRING = "Client-side Programming Language"
SERVER_SLIDE_STRINGS = ["Server-side Programming Language", "Server-side Programming Languages"]
JAVASCRIPT_LIBRARIES_STRING = "JavaScript Libraries"

def clean_url(query_url):
    """Extracts the base domain from a URL (e.g., 'example.com' from 'https://www.example.com/page')."""
    
    # Remove protocol (http, https) and 'www'
    cleaned_url = query_url.replace("http://", "").replace("https://", "").replace("www.", "")
    
    # Extract only the base domain using tldextract
    extracted = tldextract.extract(cleaned_url)
    base_domain = f"{extracted.domain}.{extracted.suffix}"  # Example: 'gchhotelgroup.com'
    
    return base_domain

def fetch_tech_stack_from_query(query_url):
    """Fetches the technology stack (client-side, server-side, and JavaScript libraries) from the provided URL."""
    if not query_url:
        return {"client_side_tech_stack": [], "server_side": [], "js_libraries_used": []}
        
    clean_query_url = clean_url(query_url)
    BASE_URL = f"https://w3techs.com/sites/info/{clean_query_url}"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    # Send GET request
    response = requests.get(BASE_URL, headers=headers)
    
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, "html.parser")
        languages = {"client_side_tech_stack": [], "server_side_tech_stack": [], "js_libraries_used": []}

        # Helper function to extract technologies for a specific section
        def extract_technologies(section_string, category_key):
            section = soup.find("p", class_="si_h", string=section_string)
            
            if section:
                current_element = section.find_next("div", class_="si_tech si_tech_np") 
                
                while current_element and current_element.find_previous("p", class_="si_h").text.strip() == section_string:
                    lang_link = current_element.find_next("p", class_="si_tech").find("a")
                    if lang_link:
                        languages[category_key].append(lang_link.text.strip())
                    current_element = current_element.find_next("div", class_="si_tech si_tech_np")

        # Extract client-side, server-side, and JS libraries
        extract_technologies(CLIENT_SLIDE_STRING, "client_side_tech_stack")
        
        # Handle JavaScript libraries separately
        js_lib_section = soup.find("p", class_="si_h", string=JAVASCRIPT_LIBRARIES_STRING)
        if js_lib_section:
            js_current_element = js_lib_section.find_next("div", class_="si_tech si_tech_np")  # First tech div
            while js_current_element and js_current_element.find_previous("p", class_="si_h").text.strip() == JAVASCRIPT_LIBRARIES_STRING:
                js_lib_link = js_current_element.find_next("p", class_="si_tech").find("a")
                if js_lib_link:
                    languages["js_libraries_used"].append(js_lib_link.text.strip())
                js_current_element = js_current_element.find_next("div", class_="si_tech si_tech_np")
        
        # Extract server-side technologies for both singular and plural forms
        for server_string in SERVER_SLIDE_STRINGS:
            extract_technologies(server_string, "server_side_tech_stack")
        
        return languages  # Return client-side, server-side, and JS libraries

    else:
        return {"client_side_tech_stack": [], "server_side_tech_stack": [], "js_libraries_used": []}  # Return empty if request fails



