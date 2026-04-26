import { Link, useNavigate } from "react-router-dom";
import "./dashboard.css";

export default function ViewerDashboard() {
  const username = localStorage.getItem("username") || "Viewer";
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="page home-page">
      <div className="logout-container" style={{ position: "absolute", top: "2rem", right: "2rem", display: "flex", gap: "10px" }}>
        <Link to="/settings" style={{ background: "rgba(255, 255, 255, 0.7)", color: "#1b4332", border: "1px solid #1b4332", padding: "8px 16px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold" }}>Settings</Link>
        <button onClick={handleLogout} style={{ background: "rgba(220, 53, 69, 0.1)", color: "#dc3545", border: "1px solid #dc3545", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>Logout</button>
      </div>
      <div className="home-container">
        <div className="home-header">
          <h2 className="welcome-banner">Welcome Viewer, {username}!</h2>
          <h1 className="home-title">Viewer Dashboard</h1>
          <p className="home-subtitle">Monitor and Track Your Regions</p>
        </div>

        <div className="dashboard-grid">
          <Link to="/dashboard/viewer/search" className="dashboard-card">
            <div className="card-icon" style={{ background: "rgba(102, 187, 106, 0.15)", color: "#2D6A4F" }}>🔍</div>
            <div className="card-content">
              <h3>Search & Map</h3>
              <p>Explore regions globally and save them to your watchlist</p>
            </div>
          </Link>

          <Link to="/dashboard/viewer/saved" className="dashboard-card">
            <div className="card-icon" style={{ background: "rgba(255, 152, 0, 0.15)", color: "#ff9800" }}>⭐</div>
            <div className="card-content">
              <h3>Saved Regions & Trends</h3>
              <p>View your pinned regions and analyze historical forest datasets</p>
            </div>
          </Link>

          <Link to="/static/get/subscription" className="dashboard-card">
            <div className="card-icon" style={{ background: "rgba(33, 150, 243, 0.15)", color: "#2196f3" }}>🔔</div>
            <div className="card-content">
              <h3>Updates Feed</h3>
              <p>Monitor real-time changes and reports for your regions</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
