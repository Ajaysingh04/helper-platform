import React, { useState } from "react";
import "../../css/SettingsCss/Security.css";

function Security() {
  const [showForm, setShowForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage("❌ New password and confirm password not matching");
      return;
    }

    setMessage("✅ Password changed successfully");

    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="security-container">
      <h2>Security</h2>

      {/* CHANGE PASSWORD BUTTON */}
      <div className="security-card">
        <h3>Password</h3>
        <p>Manage your account password</p>

        <button onClick={() => setShowForm(!showForm)}>
          Change Password
        </button>

        {/* FORM WILL OPEN AFTER CLICK */}
        {showForm && (
          <form onSubmit={handleSubmit} className="security-form">
            <input
              type="password"
              placeholder="Old Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <button type="submit">Update Password</button>
          </form>
        )}

        {message && <p className="security-msg">{message}</p>}
      </div>
    </div>
  );
}

export default Security;
