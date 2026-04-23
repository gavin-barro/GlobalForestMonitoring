import { Link, useNavigate } from "react-router-dom";
import "./dashboard.css";

export default function AdminDashboard() {
  const username = localStorage.getItem("username") || "Admin";
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="page home-page">
      <div className="logout-container" style={{ position: "absolute", top: "2rem", right: "2rem" }}>
        <button onClick={handleLogout} style={{ background: "rgba(220, 53, 69, 0.1)", color: "#dc3545", border: "1px solid #dc3545", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>Logout</button>
      </div>
      <div className="home-container">
        <div className="home-header">
          <h2 className="welcome-banner">Welcome Admin, {username}!</h2>
          <h1 className="home-title">Administrator Console</h1>
          <p className="home-subtitle">System Overwatch & User Management</p>
        </div>

        <div className="dashboard-grid">
          <Link to="/static/add/region" className="dashboard-card">
            <div className="card-icon" style={{ background: "#e8f5e9" }}>🗺️</div>
            <div className="card-content">
              <h3>Manage Regions</h3>
              <p>Add new regions, hide regions of concern</p>
            </div>
          </Link>

          <Link to="/static/add/user" className="dashboard-card">
            <div className="card-icon" style={{ background: "#e3f2fd" }}>👥</div>
            <div className="card-content">
              <h3>User Management</h3>
              <p>Add, remove, and manage user roles</p>
            </div>
          </Link>

          <Link to="/data-management" className="dashboard-card">
            <div className="card-icon" style={{ background: "#fff3e0" }}>⚙️</div>
            <div className="card-content">
              <h3>Data Management</h3>
              <p>Delete incorrect data or hide sensitive points</p>
            </div>
          </Link>

          <Link to="/pending-approvals" className="dashboard-card">
            <div className="card-icon" style={{ background: "#f3e5f5" }}>✅</div>
            <div className="card-content">
              <h3>Pending Approvals</h3>
              <p>Review and accept researcher updates</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
