import React, { useContext, useState } from "react";
import { DataContext } from "../../context/DataContext";

function AdminProviders() {
  const { providers, addProvider, updateProvider, deleteProvider } = useContext(DataContext);
  const [showModal, setShowModal] = useState(false);
  const [editingProv, setEditingProv] = useState(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Electrician");
  const [contact, setContact] = useState("+91 ");
  const [address, setAddress] = useState("");
  const [image, setImage] = useState("");
  const [verified, setVerified] = useState(true);

  const openAdd = () => {
    setEditingProv(null);
    setName("");
    setCategory("Electrician");
    setContact("+91 ");
    setAddress("Metro Zone, City");
    setImage("https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=600");
    setVerified(true);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditingProv(p);
    setName(p.name);
    setCategory(p.category);
    setContact(p.contact);
    setAddress(p.address || "");
    setImage(p.image || "");
    setVerified(p.verified !== false);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingProv) {
      updateProvider(editingProv.id, {
        name,
        category,
        contact,
        address,
        image,
        verified
      });
    } else {
      addProvider({
        name,
        category,
        contact,
        address,
        image,
        verified
      });
    }
    setShowModal(false);
  };

  return (
    <div className="admin-providers-tab animate-fade-in">
      <div className="admin-card-section">
        <div className="admin-card-header">
          <div>
            <h3>Verified Service Providers & Partners</h3>
            <p>Manage background-checked local experts, approval statuses, and ratings</p>
          </div>
          <button className="btn-primary-glow" onClick={openAdd}>
            + Register New Partner
          </button>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Partner Name</th>
                <th>Category</th>
                <th>Contact Hotline</th>
                <th>Rating & Jobs</th>
                <th>Verification</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <img 
                        src={p.image || "https://cdn-icons-png.flaticon.com/512/847/847969.png"} 
                        alt={p.name} 
                        style={{ width: "38px", height: "38px", borderRadius: "10px", objectFit: "cover" }} 
                      />
                      <div>
                        <strong>{p.name}</strong>
                        <div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>{p.address}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge-pill">{p.category}</span></td>
                  <td><strong>{p.contact}</strong></td>
                  <td>
                    <div>
                      <span>⭐ {p.rating || 4.8}</span>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{p.jobsDone || 0} bookings</div>
                    </div>
                  </td>
                  <td>
                    <button
                      className={`status-pill ${p.verified ? "status-completed" : "status-pending"}`}
                      onClick={() => updateProvider(p.id, { verified: !p.verified })}
                      style={{ cursor: "pointer", border: "none" }}
                      title="Click to toggle verification status"
                    >
                      {p.verified ? "🛡️ Verified" : "⏳ Pending ID"}
                    </button>
                  </td>
                  <td>
                    <span className="status-pill status-active">
                      {p.status || "Active"}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="table-action-btn"
                      onClick={() => openEdit(p)}
                      title="Edit Provider"
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      className="table-action-btn delete"
                      onClick={() => {
                        if (window.confirm(`Remove provider ${p.name}?`)) {
                          deleteProvider(p.id);
                        }
                      }}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Provider Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setShowModal(false)}>✕</button>
            <h3>{editingProv ? `Edit ${editingProv.name}` : "Register Service Partner"}</h3>

            <form onSubmit={handleSubmit} className="admin-modal-form">
              <div className="admin-form-group">
                <label>Provider / Business Name</label>
                <input
                  type="text"
                  placeholder="e.g. Metro Plumbers & Co."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="admin-form-group">
                  <label>Service Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Electrician, Plumber"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 00000"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Location / Address</label>
                <input
                  type="text"
                  placeholder="e.g. Sector 18, Commercial Belt"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Photo Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                  type="checkbox"
                  id="verifiedCheck"
                  checked={verified}
                  onChange={(e) => setVerified(e.target.checked)}
                  style={{ width: "20px", height: "20px", accentColor: "var(--primary)" }}
                />
                <label htmlFor="verifiedCheck" style={{ fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                  Grant 🛡️ 100% Background Verified Badge
                </label>
              </div>

              <button type="submit" className="btn-primary-glow" style={{ width: "100%", marginTop: "10px" }}>
                {editingProv ? "Save Provider Profile" : "Add Provider"} ⚡
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminProviders;
