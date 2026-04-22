import { Link } from "react-router-dom";
import "./dashboard.css";

export default function ViewerDashboard() {
  const username = localStorage.getItem("username") || "Viewer";

  return (
    <div className="page home-page">
      <div className="home-container">
        <div className="home-header">
          <h2 className="welcome-banner">Welcome Viewer, {username}!</h2>
          <h1 className="home-title">Viewer Dashboard</h1>
          <p className="home-subtitle">Monitor and Track Your Regions</p>
        </div>

        <div className="dashboard-grid">
          <Link to="/search" className="dashboard-card">
            <div className="card-icon" style={{ background: "#e8f5e9" }}>🔍</div>
            <div className="card-content">
              <h3>Search & Map</h3>
              <p>Find and view regions on the interactive map</p>
            </div>
          </Link>

          <Link to="/saved" className="dashboard-card">
            <div className="card-icon" style={{ background: "#e3f2fd" }}>⭐</div>
            <div className="card-content">
              <h3>Saved Regions</h3>
              <p>Track your saved regions and specific data trends</p>
            </div>
          </Link>

          <Link to="/static/get/subscription" className="dashboard-card">
            <div className="card-icon" style={{ background: "#fff3e0" }}>🔔</div>
            <div className="card-content">
              <h3>Subscriptions</h3>
              <p>Subscribe to feed changes in specific categories</p>
            </div>
          </Link>

          <Link to="/historical" className="dashboard-card">
            <div className="card-icon" style={{ background: "#f3e5f5" }}>📈</div>
            <div className="card-content">
              <h3>Historical Trends</h3>
              <p>Scroll through time for areas of interest</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
