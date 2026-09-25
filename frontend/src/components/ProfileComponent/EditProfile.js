import React, { useState } from "react";
import "../../css/Profile/EditProfile.css";

function EditProfile({ isOpen, onClose }) {
  const getInitialProfile = () => {
    try {
      const stored = localStorage.getItem("helper_user_profile");
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {
      name: "Ajay Singh Banafer",
      email: "ajay@example.com",
      mobile: "+91 98765 43210",
      address: "14 Palm Avenue, Metro Zone, City Central"
    };
  };

  const initial = getInitialProfile();
  const [name, setName] = useState(initial.name);
  const [email, setEmail] = useState(initial.email);
  const [mobile, setMobile] = useState(initial.mobile);
  const [address, setAddress] = useState(initial.address);
  const [msg, setMsg] = useState("");

  const updateProfile = (e) => {
    e.preventDefault();

    if (!name || !email || !mobile || !address) {
      setMsg("All fields are required");
      return;
    }

    const updated = { name, email, mobile, address };
    localStorage.setItem("helper_user_profile", JSON.stringify(updated));
    window.dispatchEvent(new Event("user_profile_updated"));
    setMsg("Profile & Address updated successfully ✅");
    setTimeout(() => {
      setMsg("");
      if (onClose) onClose();
    }, 1200);
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
