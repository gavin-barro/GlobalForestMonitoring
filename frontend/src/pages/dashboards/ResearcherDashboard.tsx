import { Link } from "react-router-dom";
import "./dashboard.css";

export default function ResearcherDashboard() {
  const username = localStorage.getItem("username") || "Researcher";

  return (
    <div className="page home-page">
      <div className="home-container">
        <div className="home-header">
          <h2 className="welcome-banner">Welcome Researcher, {username}!</h2>
          <h1 className="home-title">Researcher Portal</h1>
          <p className="home-subtitle">Advanced Analytics & Data Curation</p>
        </div>

        <div className="dashboard-grid">
          <Link to="/analytics" className="dashboard-card">
            <div className="card-icon" style={{ background: "#e8f5e9" }}>📊</div>
            <div className="card-content">
              <h3>Statistical Trends</h3>
              <p>Deep-dive monitoring of forest coverage changes</p>
            </div>
          </Link>

          <Link to="/static/add/forest_observation" className="dashboard-card">
            <div className="card-icon" style={{ background: "#e3f2fd" }}>📝</div>
            <div className="card-content">
              <h3>Suggest Updates</h3>
              <p>Draft pending data updates for admin review</p>
            </div>
          </Link>

          <Link to="/sensitive-data" className="dashboard-card">
            <div className="card-icon" style={{ background: "#fff3e0" }}>🔒</div>
            <div className="card-content">
              <h3>Sensitive Data</h3>
              <p>Access hidden/sensitive categories</p>
            </div>
          </Link>

          <Link to="/static/get/subscription" className="dashboard-card">
            <div className="card-icon" style={{ background: "#f3e5f5" }}>🔔</div>
            <div className="card-content">
              <h3>Subscriptions & Search</h3>
              <p>Standard viewer tools and region mapping</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
