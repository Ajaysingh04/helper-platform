import React, { useContext, useState } from "react";
import { DataContext } from "../../context/DataContext";

function AdminBookings() {
  const { bookings, updateBookingStatus, deleteBooking, addBooking, providers } = useContext(DataContext);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // New booking state
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [newService, setNewService] = useState("Electrician");
  const [newPrice, setNewPrice] = useState("₹299");
  const [newAddress, setNewAddress] = useState("");

  const filtered = bookings.filter(b => {
    const matchStatus = filterStatus === "All" || b.status === filterStatus;
    const matchSearch = b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        b.service.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleCreateBooking = (e) => {
    e.preventDefault();
    addBooking({
      name: newCustName,
      phone: newCustPhone,
      service: newService,
      price: newPrice,
      address: newAddress
    });
    setShowAddModal(false);
    setNewCustName("");
    setNewCustPhone("");
    setNewAddress("");
  };

  return (
    <div className="admin-bookings-tab animate-fade-in">
      
      {/* Header with controls */}
      <div className="admin-card-section">
        <div className="admin-card-header">
          <div>
            <h3>Bookings & Inquiries Management</h3>
            <p>Track, assign service providers, and manage live customer orders</p>
          </div>

          <div className="admin-header-actions">
            <button className="btn-primary-glow" onClick={() => setShowAddModal(true)}>
              + Create Manual Booking
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="Search by customer, ID, or service..."
            className="category-filter-search"
            style={{ minWidth: "280px" }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select
            className="category-sort-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses ({bookings.length})</option>
            <option value="Pending">Pending Inquiries</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Table */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer Details</th>
                <th>Service Requested</th>
                <th>Assigned Provider</th>
                <th>Location / Address</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((booking) => (
                <tr key={booking.id}>
                  <td><strong>{booking.id}</strong></td>
                  <td>
                    <div>
                      <strong>{booking.customerName}</strong>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{booking.phone}</div>
                    </div>
                  </td>
                  <td>{booking.service}</td>
                  <td>
                    <select
                      value={booking.provider || ""}
                      onChange={(e) => updateBookingStatus(booking.id, booking.status, e.target.value)}
                      style={{ padding: "4px 8px", borderRadius: "6px", background: "var(--surface-input)", border: "1px solid var(--border-color)", color: "var(--text-main)", fontSize: "12.5px" }}
                    >
                      <option value="Auto Assigned">Auto Assigned</option>
                      {providers.map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ maxWidth: "180px", fontSize: "12.5px", color: "var(--text-muted)" }}>
                    {booking.address}
                  </td>
                  <td><strong style={{ color: "var(--primary)" }}>{booking.price}</strong></td>
                  <td>
                    <select
                      value={booking.status}
                      onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                      style={{ padding: "4px 8px", borderRadius: "6px", background: "var(--surface-input)", border: "1px solid var(--border-color)", color: "var(--text-main)", fontSize: "12.5px", fontWeight: 700 }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <button 
                      className="table-action-btn delete"
                      onClick={() => {
                        if (window.confirm(`Delete booking ${booking.id}?`)) {
                          deleteBooking(booking.id);
                        }
                      }}
                      title="Delete Record"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                    No bookings found matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Booking Create Modal */}
      {showAddModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            <h3>Create Customer Booking</h3>
            <p style={{ fontSize: "13.5px", color: "var(--text-muted)" }}>Manually dispatch an on-demand order on behalf of customer.</p>

            <form onSubmit={handleCreateBooking} className="admin-modal-form">
              <div className="admin-form-group">
                <label>Customer Name</label>
                <input
                  type="text"
                  placeholder="e.g. Amit Kumar"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Customer Mobile Number</label>
                <input
                  type="tel"
                  placeholder="10-digit phone number"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Service</label>
                <input
                  type="text"
                  placeholder="e.g. Electrician, AC Repair"
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Quoted Price</label>
                <input
                  type="text"
                  placeholder="e.g. ₹299"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Customer Address</label>
                <textarea
                  rows={2}
                  placeholder="Flat number, building, sector..."
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn-primary-glow" style={{ width: "100%", marginTop: "10px" }}>
                Confirm & Create Booking ⚡
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminBookings;
