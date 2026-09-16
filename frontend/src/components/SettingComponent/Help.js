
import React, { useState } from "react";
import "../../css/SettingsCss/Help.css";

function Help() {
  const [showForm, setShowForm] = useState(false);
  const [issueName, setIssueName] = useState("");
  const [description, setDescription] = useState("");
  const [msg, setMsg] = useState("");

  const issues = [
    "Login / Signup Problem",
    "Password Change Issue",
    "Profile Update Not Working",
    "Notification Not Receiving",
    "Payment / Subscription Issue",
    "Service Not Loading",
    "Security & Privacy Issue",
    "Other Technical Issue"
  ];

  const submitIssue = (e) => {
    e.preventDefault();

    if (!issueName || !description) {
      setMsg("Please fill all fields");
      return;
    }

    console.log("New Issue:", issueName, description);
    setMsg("Your issue has been submitted successfully");

    setIssueName("");
    setDescription("");
    setShowForm(false);
  };

  return (
    <div className="help-container">
      <h2>Help & Support</h2>
      <p className="help-subtitle">
        Choose an issue or create a new one
      </p>

      {/* Issue List */}
      <div className="issue-list">
        {issues.map((issue, index) => (
          <div key={index} className="issue-card">
            {issue}
          </div>
        ))}
      </div>

      {/* Create New Issue Button */}
      <div className="create-issue">
        <button onClick={() => setShowForm(true)}>
          + Create New Issue
        </button>
      </div>

      {/* Create Issue Form */}
      {showForm && (
        <form className="issue-form" onSubmit={submitIssue}>
          <h3>Create New Issue</h3>

          <input
            type="text"
            placeholder="Your issue name"
            value={issueName}
            onChange={(e) => setIssueName(e.target.value)}
          />

          <textarea
            placeholder="Describe your issue..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>

          <div className="form-actions">
            <button type="submit">Submit Issue</button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>

          {msg && <p className="msg">{msg}</p>}
        </form>
      )}
    </div>
  );
}

export default Help;
