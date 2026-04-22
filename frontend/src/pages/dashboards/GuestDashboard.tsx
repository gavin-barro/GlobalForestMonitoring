import { Link } from "react-router-dom";
import "./dashboard.css";

export default function GuestDashboard() {
  return (
    <div className="page home-page">
      <div className="home-container">
        <div className="home-header">
          <h2 className="welcome-banner">Welcome Guest!</h2>
          <h1 className="home-title">Guest Portal</h1>
          <p className="home-subtitle">Explore Public Global Forest Data</p>
        </div>

        <div className="dashboard-grid">
          <Link to="/static/get/feed" className="dashboard-card">
            <div className="card-icon" style={{ background: "#e8f5e9" }}>📰</div>
            <div className="card-content">
              <h3>View Update Feed</h3>
              <p>Browse the latest public forest observations</p>
            </div>
          </Link>

          <Link to="/regions" className="dashboard-card">
            <div className="card-icon" style={{ background: "#e3f2fd" }}>🌍</div>
            <div className="card-content">
              <h3>View Regions</h3>
              <p>Explore basic geographic region data</p>
            </div>
          </Link>

          <Link to="/search" className="dashboard-card">
            <div className="card-icon" style={{ background: "#fff3e0" }}>🔍</div>
            <div className="card-content">
              <h3>Search Regions</h3>
              <p>Search for specific public regions of interest</p>
            </div>
          </Link>

          <Link to="/historical" className="dashboard-card">
            <div className="card-icon" style={{ background: "#f3e5f5" }}>⏳</div>
            <div className="card-content">
              <h3>Historical Data</h3>
              <p>View public historical records and timeline data</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
