import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllRegions } from '../services';
import { type Region } from '../types';
import './dashboards/dashboard.css';

export default function PublicRegions() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllRegions().then(data => {
      setRegions(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="page home-page" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "1rem 2rem", width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
        <Link to="/dashboard/guest" style={{ color: "#2D6A4F", textDecoration: "none", fontWeight: "bold" }}>← Back to Dashboard</Link>
      </div>

      <div style={{ flex: 1, padding: "2rem", maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
        <h1 style={{ color: "#1b4332", fontSize: "2.5rem", marginBottom: "0.5rem" }}>Regional Directory</h1>
        <p style={{ color: "#5C6E61", fontSize: "1.1rem", marginBottom: "2rem" }}>A public list of all regions currently being monitored by our network.</p>

        {loading ? (
          <p>Loading regions...</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {regions.map(r => (
              <div key={r.region_id} style={{ 
                background: "rgba(255,255,255,0.7)", 
                backdropFilter: "blur(10px)", 
                padding: "1.5rem", 
                borderRadius: "16px", 
                boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
                border: "1px solid rgba(255,255,255,0.5)"
              }}>
                <h3 style={{ margin: 0, color: "#1b4332", fontSize: "1.2rem" }}>{r.region_name}</h3>
                <p style={{ color: "#2D6A4F", fontWeight: "600", fontSize: "0.9rem", marginTop: "4px" }}>Type: {r.region_type}</p>
                <div style={{ marginTop: "12px" }}>
                  <Link 
                    to={`/dashboard/viewer/search?query=${encodeURIComponent(r.region_name)}`}
                    style={{ color: "#1b4332", fontSize: "0.85rem", fontWeight: "bold", textDecoration: "none", borderBottom: "1px solid #1b4332" }}
                  >
                    View on Map →
                  </Link>
                </div>
              </div>
            ))}
            {regions.length === 0 && <p>No regions found.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
