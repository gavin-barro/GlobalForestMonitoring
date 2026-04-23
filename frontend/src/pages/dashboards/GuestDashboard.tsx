import { Link, useNavigate } from "react-router-dom";
import "./dashboard.css";

export default function GuestDashboard() {
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
          <h2 className="welcome-banner">Welcome Guest!</h2>
          <h1 className="home-title">Public Data Portal</h1>
          <p className="home-subtitle">Exploring Global Forest Monitoring Insights</p>
        </div>

        <div className="dashboard-grid">
          <Link to="/dashboard/viewer/search" className="dashboard-card">
            <div className="card-icon" style={{ background: "rgba(102, 187, 106, 0.15)", color: "#2D6A4F" }}>🔍</div>
            <div className="card-content">
              <h3>Explore Map</h3>
              <p>Search and visualize global forest regions on an interactive map</p>
            </div>
          </Link>

          <Link to="/static/get/feed" className="dashboard-card">
            <div className="card-icon" style={{ background: "rgba(255, 152, 0, 0.15)", color: "#ff9800" }}>📰</div>
            <div className="card-content">
              <h3>Global Feed</h3>
              <p>Browse the latest public forest observations and real-time updates</p>
            </div>
          </Link>

          <Link to="/regions" className="dashboard-card">
            <div className="card-icon" style={{ background: "rgba(33, 150, 243, 0.15)", color: "#2196f3" }}>🌍</div>
            <div className="card-content">
              <h3>Regional Data</h3>
              <p>View detailed public listings of monitored regions around the world</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
