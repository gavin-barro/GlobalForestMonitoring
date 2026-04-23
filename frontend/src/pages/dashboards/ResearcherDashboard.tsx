import { Link, useNavigate } from "react-router-dom";
import "./dashboard.css";

export default function ResearcherDashboard() {
  const username = localStorage.getItem("username") || "Researcher";
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
          <h2 className="welcome-banner">Welcome Researcher, {username}!</h2>
          <h1 className="home-title">Researcher Workbench</h1>
          <p className="home-subtitle">Data Analysis & Forest Insight</p>
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
