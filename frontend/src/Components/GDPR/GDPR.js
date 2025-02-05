import React from "react";

const GDPR = () => {
  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "auto" }}>
      <h1>GDPR Compliance</h1>
      <p><strong>Last Updated:</strong> [05.02.2025]</p>

      <h2>1. Your Rights Under GDPR</h2>
      <p>As a resident of the EU, you have the following rights regarding your personal data:</p>
      <ul>
        <li>The right to access your data.</li>
        <li>The right to correct inaccurate information.</li>
        <li>The right to request data deletion.</li>
        <li>The right to restrict or object to processing.</li>
        <li>The right to data portability.</li>
      </ul>

      <h2>2. Data Processing & Storage</h2>
      <p>We process your data lawfully and securely. Your data is stored on encrypted servers.</p>

      <h2>3. How to Request Data Deletion</h2>
      <p>You can request deletion of your personal data by emailing us at <a href="mailto:info.codefinity@gmail.com">info.codefinity@gmail.com</a>.</p>

      <h2>4. Contacting a Data Protection Officer</h2>
      <p>If you have concerns about how we handle your data, you can contact our Data Protection Officer at the same email address.</p>
    </div>
  );
};

export default GDPR;
