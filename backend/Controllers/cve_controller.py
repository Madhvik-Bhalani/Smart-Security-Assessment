import requests
import os
from datetime import datetime, timedelta, timezone

# Define the NVD API endpoint and key
NVD_API_KEY = os.getenv("NVD_API_KEY")  # Replace with your actual API key
NVD_CVE_URL = "https://services.nvd.nist.gov/rest/json/cves/2.0"

def get_cves():
    """Fetch CVEs from the last 1 year (using 120-day batches)"""
    headers = {"apiKey": NVD_API_KEY, "Content-Type": "application/json"}

    # Calculate the start and end date (last 1 year)
    end_date = datetime.now(timezone.utc)  # Current date
    start_date = end_date - timedelta(days=365)  # 1 year ago

    # Batch size: Max 120 days at a time
    batch_days = 120
    all_cves = []

    while start_date < end_date:
        # Calculate the batch end date (max 120 days at a time)
        batch_end_date = min(start_date + timedelta(days=batch_days), end_date)

        # Format dates in ISO 8601 format for the NVD API
        pub_start_date = start_date.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"
        pub_end_date = batch_end_date.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"

        params = {
            "resultsPerPage": 2000,  # max limit 2000 records per request
            "pubStartDate": pub_start_date,
            "pubEndDate": pub_end_date,
        }

        try:
            response = requests.get(NVD_CVE_URL, headers=headers, params=params)
            response.raise_for_status()
            cve_data = response.json()

            # Extract and store CVE data
            if "vulnerabilities" in cve_data:
                all_cves.extend(cve_data["vulnerabilities"])

            print(f"Fetched data from {pub_start_date} to {pub_end_date} ({len(cve_data.get('vulnerabilities', []))} records)")

        except requests.RequestException as e:
            print(f"Failed to fetch CVEs for {pub_start_date} - {pub_end_date}: {str(e)}")
        
        # Move to the next batch
        start_date = batch_end_date + timedelta(days=1)

    # Process and format data
    formatted_cves = []
    for cve in all_cves:
        metrics_v31 = cve["cve"]["metrics"].get("cvssMetricV31", [{}])[0]
        metrics_v2 = cve["cve"]["metrics"].get("cvssMetricV2", [{}])[0]

        # Extract CVSS scores (prefer v3.1, fallback to v2)
        base_severity = metrics_v31.get("cvssData", {}).get("baseSeverity", metrics_v2.get("baseSeverity", "Unknown"))
        exploitability_score = metrics_v31.get("exploitabilityScore", metrics_v2.get("exploitabilityScore", "Unknown"))
        impact_score = metrics_v31.get("impactScore", metrics_v2.get("impactScore", "Unknown"))

        # Store structured CVE data
        formatted_cves.append({
            "id": cve["cve"]["id"],
            "description": cve["cve"]["descriptions"][0]["value"],
            "severity": base_severity,
            "exploitability_score": exploitability_score,
            "impact_score": impact_score,
            "published_date": cve["cve"]["published"],
            "last_modified_date": cve["cve"]["lastModified"],
        })

    # Deduplicate CVEs
    unique_cves = {cve["id"]: cve for cve in formatted_cves}.values()

    # Sort by `published_date` in descending order
    sorted_cves = sorted(
        unique_cves,
        key=lambda x: datetime.strptime(x["published_date"], "%Y-%m-%dT%H:%M:%S.%f"),
        reverse=True,
    )

    return len(sorted_cves), sorted_cves
