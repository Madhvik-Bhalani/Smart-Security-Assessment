from cve_utils import fetch_cves_for_last_120_days

# Example Usage
technologies = ["WPManageNinja"]
results = {}

for tech in technologies:
    results[tech] = fetch_cves_for_last_120_days(tech,max_result=2000)

# Display results
for tech, cves in results.items():
    print(f"Latest CVEs for {tech} (Last 120 days):")
    if "error" in cves:
        print(cves["error"])
    else:
        for cve in cves:
            print(f"- CVE ID: {cve['id']}")
            print(f"  Description: {cve['description']}")
            print(f"  Severity: {cve['severity']}")
            print(f"  Exploitability Score: {cve['exploitability_score']}")
            print(f"  Impact Score: {cve['impact_score']}")
            print(f"  Published Date: {cve['published_date']}")
            print(f"  Last Modified Date: {cve['last_modified_date']}")
            print("---")
