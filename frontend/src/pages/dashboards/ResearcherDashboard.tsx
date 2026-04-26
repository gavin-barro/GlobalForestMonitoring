import { Link, useNavigate } from "react-router-dom";
import StatsBanner from "../../components/StatsBanner";
import "./dashboard.css";

export default function ResearcherDashboard() {
  const username = localStorage.getItem("username") || "Researcher";
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="page home-page" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "absolute", top: "2rem", right: "2rem", display: "flex", gap: "10px" }}>
        <Link to="/settings" style={{ background: "rgba(255, 255, 255, 0.7)", color: "#1b4332", border: "1px solid #1b4332", padding: "8px 16px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold" }}>Settings</Link>
        <button onClick={handleLogout} style={{ background: "rgba(220, 53, 69, 0.1)", color: "#dc3545", border: "1px solid #dc3545", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>Logout</button>
      </div>
      
      <div className="home-container" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div className="home-header">
          <h2 className="welcome-banner">Welcome, {username}!</h2>
          <h1 className="home-title">Researcher Workbench</h1>
          <p className="home-subtitle" style={{ marginBottom: "2rem" }}>Analyze trends and propose localized forest updates.</p>
        </div>

        <StatsBanner userId={Number(localStorage.getItem('user_id') || 0)} role="Researcher" />

        <div className="dashboard-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
        
          <Link to="/dashboard/viewer/search" className="dashboard-card" style={{ height: "130px" }}>
            <div className="card-icon" style={{ background: "#e8f5e9" }}>🌍</div>
            <div className="card-content">
              <h3>Explore Data & Map</h3>
              <p>Browse global forest layers and boundaries</p>
            </div>
          </Link>

          <Link to="/dashboard/viewer/historical" className="dashboard-card" style={{ height: "130px" }}>
            <div className="card-icon" style={{ background: "#f3e5f5" }}>📈</div>
            <div className="card-content">
              <h3>Statistical Trends</h3>
              <p>Deep-dive analysis of coverage changes</p>
            </div>
          </Link>

          <Link to="/dashboard/researcher/suggest-update" className="dashboard-card" style={{ height: "130px" }}>
            <div className="card-icon" style={{ background: "#e3f2fd" }}>📝</div>
            <div className="card-content">
              <h3>Suggest Update</h3>
              <p>Draft new forest observations for admin review</p>
            </div>
          </Link>

          <Link to="/dashboard/researcher/my-updates" className="dashboard-card" style={{ height: "130px" }}>
            <div className="card-icon" style={{ background: "#fff3e0" }}>📋</div>
            <div className="card-content">
              <h3>My Proposals</h3>
              <p>Track the status of your submitted updates</p>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}
