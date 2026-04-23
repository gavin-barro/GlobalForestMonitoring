import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../dashboards/dashboard.css';

interface Subscription {
  user_id: number;
  metric_id: number;
  region_id: number;
  active: boolean;
}

interface Region {
  region_id: number;
  region_name: string;
  region_type: string;
}

interface RegionCardData extends Subscription {
  region_name: string;
  region_type: string;
}

export default function SavedRegions() {
  const [saved, setSaved] = useState<RegionCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSavedRegions = async () => {
      const userIdStr = localStorage.getItem('user_id');
      if (!userIdStr) {
        setLoading(false);
        return;
      }
      try {
        // Fetch subscriptions 
        const subRes = await fetch(`http://localhost:8000/subscriptions/by-user/${userIdStr}`);
        if (!subRes.ok) throw new Error("Failed to fetch subscriptions");
        const subs: Subscription[] = await subRes.json();
        
        // Fetch region details for each subscription
        const regionPromises = subs.map(async (sub) => {
          const regRes = await fetch(`http://localhost:8000/regions/${sub.region_id}`);
          if (regRes.ok) {
            const region: Region = await regRes.json();
            return {
              ...sub,
              region_name: region.region_name,
              region_type: region.region_type
            };
          }
          return null;
        });

        const results = await Promise.all(regionPromises);
        setSaved(results.filter(r => r !== null) as RegionCardData[]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSavedRegions();
  }, []);

  return (
    <div className="page home-page" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "1rem 2rem", width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
        <Link to="/dashboard/viewer" style={{ color: "#2D6A4F", textDecoration: "none", fontWeight: "bold" }}>← Back to Dashboard</Link>
      </div>

      <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
        <h1 style={{ color: "#1b4332", fontSize: "2.5rem", marginTop: "1.5rem" }}>My Saved Regions</h1>
        <p style={{ color: "#5C6E61", fontSize: "1.1rem" }}>Regions you are actively subscribing to and monitoring.</p>

        {loading ? (
          <p>Loading your regions...</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem", marginTop: "2rem" }}>
            {saved.map(item => (
              <div 
                key={item.region_id}
                onClick={() => navigate(`/dashboard/viewer/historical?region_id=${item.region_id}&region_name=${encodeURIComponent(item.region_name)}`)}
                style={{
                  background: "rgba(255,255,255,0.7)",
                  backdropFilter: "blur(10px)",
                  padding: "1.5rem",
                  borderRadius: "16px",
                  border: "1px solid rgba(255,255,255,0.8)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
                  cursor: "pointer",
                  transition: "transform 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <h3 style={{ margin: 0, color: "#1b4332", fontSize: "1.4rem" }}>{item.region_name}</h3>
                  <span style={{ background: "#E6E1D6", color: "#2D6A4F", padding: "4px 8px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "bold" }}>
                    {item.region_type}
                  </span>
                </div>
                <p style={{ margin: 0, color: "#5C6E61", fontSize: "0.95rem" }}>Click to view historical trends</p>
                <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: item.active ? "#2e7d32" : "#ccc" }}></div>
                  <span style={{ fontSize: "0.85rem", color: "#888" }}>Status: {item.active ? 'Active Subscription' : 'Inactive'}</span>
                </div>
              </div>
            ))}
            {saved.length === 0 && (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "3rem", background: "rgba(255,255,255,0.4)", borderRadius: "16px" }}>
                <h3 style={{ color: "#1b4332" }}>No regions saved yet.</h3>
                <p style={{ color: "#5C6E61" }}>Head over to the map search to find and pin regions.</p>
                <button onClick={() => navigate('/dashboard/viewer/search')} style={{ marginTop: "1rem", padding: "10px 20px", background: "#2D6A4F", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
                  Search Regions
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
