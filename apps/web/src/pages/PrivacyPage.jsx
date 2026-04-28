import React from "react";

export default function PrivacyPage() {
  return (
    <div style={{ padding: "40px", maxWidth: "900px", margin: "auto" }}>
      <h1>Privacy Policy</h1>

      <p>
        RentShield collects user data such as email, name, and rental details
        to provide services.
      </p>

      <h3>Data Usage</h3>
      <p>
        Data is used to manage agreements and improve user experience.
      </p>

      <h3>Data Storage</h3>
      <p>
        Data is securely stored using Firebase services.
      </p>

      <h3>Third-Party Services</h3>
      <p>
        We may use third-party services such as payment providers.
      </p>

      <h3>Security</h3>
      <p>
        We take reasonable steps to protect your data.
      </p>

      <h3>User Rights</h3>
      <p>
        Users can request deletion of their data by contacting us.
      </p>
    </div>
  );
}
