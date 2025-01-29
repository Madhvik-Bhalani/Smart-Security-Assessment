import requests
import os
from datetime import datetime, timedelta

NVD_API_URL = os.getenv("NVD_API_URL")  # Ensure this is set in your .env file


def get_cves(start: int, length: int):
    """
    Fetches and processes paginated CVE data from the NVD API.
    :param start: Starting index for pagination.
    :param length: Number of records per page.
    :return: Total records and paginated CVE data.
    """
    headers = {
        "Content-Type": "application/json",
        "apiKey": os.getenv("NVD_API_KEY"),
    }

   # Define the date range (last 121 days)
    today = datetime.now()
    start_date = today - timedelta(days=1)

    # Format dates in ISO-8601
    pub_start_date = start_date.strftime("%Y-%m-%dT00:00:00.000")
    pub_end_date = today.strftime("%Y-%m-%dT23:59:59.999")

    # Set parameters
    params = {
        "pubStartDate": pub_start_date,
        "pubEndDate": pub_end_date,
        "resultsPerPage":1
    }

    if not NVD_API_URL:
        raise Exception("Missing NVD_API_URL in .env file.")

    try:
        response = requests.get(NVD_API_URL, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()

        # Get total number of records
        total_records = data.get("totalResults", 0)

        # Process and flatten the vulnerabilities
        vulnerabilities = data.get("vulnerabilities", [])
        flattened_data = []

        # print(vulnerabilities)
        for item in vulnerabilities:
            cve = item.get("cve", {})
            metrics = cve.get("metrics", {})
            cvss_metrics = metrics.get("cvssMetricV31", [{}])

            flattened_data.append(
                {
                    "id": cve.get("id", "N/A"),
                    "description": (
                        cve.get("descriptions", [{}])[0].get(
                            "value", "No description available"
                        )
                    ),
                    "severity": cvss_metrics[0].get("baseSeverity", "N/A"),
                    "published_date": cve.get("published", "N/A"),
                    "last_modified_date": cve.get("lastModified", "N/A"),
                    "exploitability_score": cvss_metrics[0].get(
                        "exploitabilityScore", "N/A"
                    ),
                    "impact_score": cvss_metrics[0].get("impactScore", "N/A"),
                    "references": [
                        ref.get("url", "N/A") for ref in cve.get("references", [])
                    ],
                }
            )

        return total_records, flattened_data
    except requests.exceptions.RequestException as e:
        raise Exception(f"Error fetching CVEs from NVD API: {e}")
