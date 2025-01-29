import React, { useState, useEffect } from "react";
import "./CveTable.css";

const CveTable = ({ onKnowMore }) => {
    const [cveData, setCveData] = useState([]); // Store all CVE data
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch all data when the component mounts
        const fetchAllData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");
                const response = await fetch("http://localhost:5000/api/v1/cves", {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token,
                    },
                });                

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                setCveData(data.data); // Store all fetched data
            } catch (error) {
                console.error("Error fetching CVE data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    useEffect(() => {
        if (!loading && cveData.length > 0) {
            const table = window.$("#cveTable").DataTable({
                data: cveData, // Provide the fetched data to DataTables
                columns: [
                    {
                        data: "id",
                        render: (data) =>
                            `<a href="https://nvd.nist.gov/vuln/detail/${data}" target="_blank" class="cve-link">${data}</a>`,
                    },
                    { data: "description" },
                    {
                        data: "published_date",
                        render: (data) => {
                            // Format date
                            const date = new Date(data);
                            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
                                date.getDate()
                            ).padStart(2, "0")}`;
                        },
                    },
                    { data: "severity" },
                    { data: "exploitability_score" },
                    { data: "impact_score" },
                    {
                        data: "id",
                        render: (data) =>
                            `<button class="btn btn-primary" onclick="onKnowMore('${data}')">Know More</button>`,
                    },
                ],
                order: [[2, "desc"]], // Default order: published_date descending
                pageLength: 10, // Default page size
                lengthMenu: [[10, 25, 50, 100], [10, 25, 50, 100]], // Options for page size
                destroy: true, // Allow reinitialization
            });

            return () => {
                table.destroy(); // Cleanup
            };
        }
    }, [loading, cveData]);

    return (
        <div className="cve-table-container">
            <h1 className="heading text-center">Latest CVEs</h1>
            <p className="subheading text-center">
                Explore the most recent Common Vulnerabilities and Exposures (CVEs). Stay informed and secure.
            </p>
            {loading ? (
                <p className="loading-text text-center">Loading CVEs...</p>
            ) : (
                <div className="table-responsive py-4">
                    <table id="cveTable" className="display table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>CVE ID</th>
                                <th>Description</th>
                                <th>Published Date</th>
                                <th>Severity</th>
                                <th>Exploitability Score</th>
                                <th>Impact Score</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CveTable;
