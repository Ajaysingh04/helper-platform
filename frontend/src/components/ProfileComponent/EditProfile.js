import React, { useState } from "react";
import "../../css/Profile/EditProfile.css";

function EditProfile({ isOpen, onClose }) {
  const [name, setName] = useState("Ajay Singh");
  const [email, setEmail] = useState("ajay@gmail.com");
  const [mobile, setMobile] = useState("9876543210");
  const [address, setAddress] = useState("Indore, India");
  const [msg, setMsg] = useState("");

  const updateProfile = (e) => {
    e.preventDefault();

    if (!name || !email || !mobile || !address) {
      setMsg("All fields are required");
      return;
    }

    // future: API call here
    setMsg("Profile updated successfully ✅");
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`edit-overlay ${isOpen ? "show" : ""}`}
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className={`edit-drawer ${isOpen ? "open" : ""}`}>
        <div className="edit-header">
          <h2>Edit Profile</h2>
          <button onClick={onClose}>✖</button>
        </div>

        <form className="edit-profile-form" onSubmit={updateProfile}>
          <input
            type="text"
            value={name}
            placeholder="Name"
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            value={email}
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="text"
            value={mobile}
            placeholder="Mobile Number"
            onChange={(e) => setMobile(e.target.value)}
          />

          <textarea
            value={address}
            placeholder="Address"
            onChange={(e) => setAddress(e.target.value)}
          ></textarea>

          <button type="submit">Save Changes</button>
          <p className="msg">{msg}</p>
        </form>
      </div>
    </>
  );
}

export default EditProfile;
