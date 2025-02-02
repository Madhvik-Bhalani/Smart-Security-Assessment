import React, { useState, useEffect, useRef } from "react";
import $ from "jquery"; // Import jQuery
import "datatables.net"; // Import DataTables

const CveTable = () => {
    const [cveData, setCveData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const dataFetched = useRef(false); // Prevent duplicate API calls
    let table = null; // Store reference to DataTable instance

    useEffect(() => {
        if (!dataFetched.current) {
            fetchCveData();
            dataFetched.current = true; // Mark as fetched
        }
    }, []);

    const fetchCveData = async () => {
        try {
            setLoading(true);
            setError(null);
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
            setCveData(data.data);
        } catch (error) {
            console.error("Error fetching CVE data:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!loading && cveData.length > 0) {
            if ($.fn.DataTable.isDataTable("#cveTable")) {
                table.destroy(); // Destroy existing table before reinitializing
            }

            table = $("#cveTable").DataTable({
                data: cveData,
                destroy: true,
                columns: [
                    {
                        data: "id",
                        render: function (data) {
                            return `<a href="https://nvd.nist.gov/vuln/detail/${data}" target="_blank" class="cve-link">${data}</a>`;
                        },
                    },
                    { data: "description" },
                    {
                        data: "published_date",
                        render: function (data) {
                            const date = new Date(data);
                            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
                                date.getDate()
                            ).padStart(2, "0")}`;
                        },
                    },
                    { data: "severity" },
                    { data: "exploitability_score" },
                    { data: "impact_score" },
                ],
                order: [[2, "desc"]],
                pageLength: 10,
                lengthMenu: [[10, 25, 50, 100], [10, 25, 50, 100]],
                searching: true,
                paging: true,
                autoWidth: false,
            });

            return () => {
                table.destroy();
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
            ) : error ? (
                <p className="error-text text-center">Error: {error}</p>
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
                            </tr>
                        </thead>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CveTable;
