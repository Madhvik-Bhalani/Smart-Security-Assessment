import requests
import os
from datetime import datetime, timedelta, timezone

# Define the NVD API endpoint and key
NVD_API_KEY = os.getenv("NVD_API_KEY")  # Replace with your actual API key
NVD_CVE_URL = "https://services.nvd.nist.gov/rest/json/cves/2.0"


def fetch_cves_for_last_120_days(technology, max_result):
    """Fetch CVEs for a specific technology for the last 120 days."""
    headers = {"apiKey": NVD_API_KEY, "Content-Type": "application/json"}

    # Calculate the date range (120 days ago to today)
    end_date = datetime.now(timezone.utc)  # Use timezone-aware UTC datetime
    start_date = end_date - timedelta(days=120)

    # Format dates in ISO 8601 format for the NVD API
    pub_start_date = start_date.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"
    pub_end_date = end_date.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"

    params = {
        "keywordSearch": technology,
        "resultsPerPage": max_result,
        "pubStartDate": pub_start_date,
        "pubEndDate": pub_end_date,
    }

    try:
        response = requests.get(NVD_CVE_URL, headers=headers, params=params)
        response.raise_for_status()
        cve_data = response.json()

        # Extract and structure CVE data
        cves = []
        for cve in cve_data.get("vulnerabilities", []):
            metrics_v31 = cve["cve"]["metrics"].get("cvssMetricV31", [{}])[0]
            metrics_v2 = cve["cve"]["metrics"].get("cvssMetricV2", [{}])[0]

            # Check for CVSS v3.1 first, fallback to CVSS v2
            if metrics_v31 and "cvssData" in metrics_v31:
                base_severity = metrics_v31["cvssData"].get("baseSeverity", "Unknown")
                exploitability_score = metrics_v31.get("exploitabilityScore", "Unknown")
                impact_score = metrics_v31.get("impactScore", "Unknown")
            elif metrics_v2:
                base_severity = metrics_v2.get(
                    "baseSeverity", "Unknown"
                )  # Directly in cvssMetricV2
                exploitability_score = metrics_v2.get("exploitabilityScore", "Unknown")
                impact_score = metrics_v2.get("impactScore", "Unknown")
            else:
                base_severity = "Unknown"
                exploitability_score = "Unknown"
                impact_score = "Unknown"

            # Append structured CVE data
            cve_item = {
                "id": cve["cve"]["id"],
                "description": cve["cve"]["descriptions"][0]["value"],
                "severity": base_severity,
                "exploitability_score": exploitability_score,
                "impact_score": impact_score,
                "published_date": cve["cve"]["published"],
                "last_modified_date": cve["cve"]["lastModified"],
            }
            cves.append(cve_item)
        # Deduplicate CVEs by ID
        unique_cves = {cve["id"]: cve for cve in cves}.values()

        # Sort CVEs by published_date in descending order
        sorted_cves = sorted(
            unique_cves,
            key=lambda x: datetime.strptime(
                x["published_date"], "%Y-%m-%dT%H:%M:%S.%f"
            ),
            reverse=True,
        )

        return sorted_cves[:3]
    except requests.RequestException as e:
        return {"error": f"Failed to fetch CVEs for {technology}: {str(e)}"}


def extract_technologies_from_query(query, llm):
    """
    Use the LLM to extract technologies or technical terms mentioned in the query.
    Returns a single list of extracted items (technologies or terms).
    """
    prompt = f"""
    You are a language model trained to extract technology names and relevant technical terms from text. 
    Your task is to identify the technologies or technical terms mentioned in a query (e.g., Apache, 
    React, MySQL, authentication, cross-site scripting, filesystem, etc.).

    Follow these instructions:
    1. Extract names of technologies or technical terms directly mentioned in the query.
    2. Do not include general phrases or unrelated content.
    3. Return the extracted items as a single comma-separated list.
    4. If no relevant items are detected, return an empty list.

    Examples:
    - Query: "What are the latest vulnerabilities in Apache and MySQL?"
      Output: Apache, MySQL
    - Query: "Give me CVEs for authentication and cross-site scripting."
      Output: authentication, cross-site scripting
    - Query: "Can you tell me about React and filesystem issues?"
      Output: React, filesystem
    - Query: "Tell me about general vulnerabilities."
      Output: []

    Query: "{query}"

    Return the extracted items as a comma-separated list:
    """

    # Invoke the LLM with the prompt
    response = llm.invoke(input=prompt)

    # Post-process the response to create a clean list
    extracted_items = [
        item.strip() for item in response.content.split(",") if item.strip()
    ]

    return extracted_items


def format_cve_response(cve_data, llm):
    """Use the LLM to format CVE data into a user-friendly report."""
    prompt = f"""
    You are a language model that formats CVE data into a detailed, user-friendly report. 
    Your task is to process the following CVE data and generate a professional report for the user.

    ### Instructions:
    - Organize the CVE data clearly and concisely.
    - Group CVEs by technology and create a section for each.
    - For each CVE, include the following details:
      - CVE ID (make it a clickable link to the NVD website, e.g., https://nvd.nist.gov/vuln/detail/{'{CVE-ID}'})
      - Description
      - Severity
      - Exploitability Score
      - Impact Score
      - Published Date
      - Last Modified Date
    - Avoid unnecessary repetition and make the report easy to understand.

    CVE Data:
    {cve_data}

    Generate the formatted report:
    """
    response = llm.invoke(input=prompt)
    return response.content
