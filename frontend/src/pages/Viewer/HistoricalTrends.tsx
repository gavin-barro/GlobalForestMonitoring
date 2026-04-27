import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../dashboards/dashboard.css';

interface Observation {
  observation_id: number;
  value: number;
  source_date: string;
  period_id: number;
  metric_id: number;
  region_id: number;
}

interface Subscription {
  user_id: number;
  metric_id: number;
  region_id: number;
  active: boolean;
}

interface RegionMeta {
  region_id: number;
  region_name: string;
  region_type: string;
}

interface RegionCardData extends Subscription {
  region_name: string;
  region_type: string;
}

export default function HistoricalTrends() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const regionId = searchParams.get('region_id');
  const regionName = searchParams.get('region_name') || 'Selected Region';

  const [data, setData] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);

  // Fallback states for when no region is selected
  const [savedRegions, setSavedRegions] = useState<RegionCardData[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  useEffect(() => {
    if (!regionId) {
      setLoading(false);
      setLoadingSaved(true);
      const fetchSavedRegions = async () => {
        let userIdStr = localStorage.getItem('user_id');
        const acctType = localStorage.getItem('acct_type');
        if (!userIdStr && acctType?.toLowerCase() === 'researcher') userIdStr = '0';
        if (!userIdStr) {
          setLoadingSaved(false);
          return;
        }

        try {
          const subRes = await fetch(`http://localhost:8000/subscriptions/by-user/${userIdStr}`);
          if (!subRes.ok) throw new Error("Failed to fetch subscriptions");
          const subs: Subscription[] = await subRes.json();
          
          const regionPromises = subs.map(async (sub) => {
            const regRes = await fetch(`http://localhost:8000/regions/${sub.region_id}`);
            if (regRes.ok) {
              const region: RegionMeta = await regRes.json();
              return { ...sub, region_name: region.region_name, region_type: region.region_type };
            }
            return null;
          });

          const results = await Promise.all(regionPromises);
          setSavedRegions(results.filter(r => r !== null) as RegionCardData[]);
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingSaved(false);
        }
      };
      
      fetchSavedRegions();
      return;
    }

    const fetchObservations = async () => {
      try {
        const res = await fetch(`http://localhost:8000/forest_observations/by_region/${regionId}`);
        if (res.ok) {
          const obsData: Observation[] = await res.json();
          // Sort by date so the line chart flows correctly left-to-right
          obsData.sort((a, b) => new Date(a.source_date).getTime() - new Date(b.source_date).getTime());
          setData(obsData);
        }
      } catch (err) {
        console.error("Error fetching historical data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchObservations();
  }, [regionId]);

  const acctType = localStorage.getItem('acct_type');
  let backLink = '/dashboard/viewer/saved';
  let backText = '← Back to Saved Regions';

  if (acctType === 'Researcher') {
     backLink = '/dashboard/researcher';
     backText = '← Back to Dashboard';
  } else if (acctType === 'Guest') {
     backLink = '/dashboard/guest';
     backText = '← Back to Public Portal';
  }


  return (
    <div className="page home-page" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "1rem 2rem", width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
        <Link to={backLink} style={{ color: "#2D6A4F", textDecoration: "none", fontWeight: "bold" }}>{backText}</Link>
      </div>

      <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        <h1 style={{ color: "#1b4332", fontSize: "2.5rem", marginTop: "1.5rem" }}>Historical Trends for {regionName}</h1>
        <p style={{ color: "#5C6E61", fontSize: "1.1rem", marginBottom: "2rem" }}>Analyzing forest cover changes over time based on historical observations.</p>

        {!regionId ? (
          loadingSaved ? (
            <p>Loading your saved regions...</p>
          ) : (
            <>
              <p style={{ color: "#5C6E61", fontSize: "1.1rem", marginBottom: "1rem" }}>Please select a region from your Subscriptions to view historical data.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
                {savedRegions.map(item => (
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
                  </div>
                ))}
                {savedRegions.length === 0 && (
                  <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "3rem", background: "rgba(255,255,255,0.4)", borderRadius: "16px" }}>
                    <p style={{ color: "#5C6E61" }}>No regions saved yet. Head over to the map search to find and pin regions.</p>
                    <button onClick={() => navigate('/dashboard/viewer/search')} style={{ marginTop: "1rem", padding: "10px 20px", background: "#2D6A4F", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
                      Search Regions
                    </button>
                  </div>
                )}
              </div>
            </>
          )
        ) : loading ? (
          <p>Loading historical data...</p>
        ) : data.length === 0 ? (
          <div style={{ padding: "2rem", background: "rgba(255,255,255,0.7)", borderRadius: "12px", textAlign: "center" }}>
            <p style={{ color: "#5C6E61", fontSize: "1.1rem" }}>No historical data found for this region.</p>
          </div>
        ) : (
          <div style={{ background: "rgba(255,255,255,0.85)", padding: "2rem", borderRadius: "20px", boxShadow: "0 12px 30px rgba(0,0,0,0.06)", height: "500px" }}>
            <h3 style={{ marginTop: 0, marginBottom: "1.5rem", color: "#1b4332" }}>Observation Values</h3>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis 
                  dataKey="source_date" 
                  tick={{ fill: '#5C6E61' }} 
                  tickFormatter={(val) => new Date(val).getFullYear().toString()}
                />
                <YAxis 
                  domain={['auto', 'auto']} 
                  tick={{ fill: '#5C6E61' }} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} 
                  labelFormatter={(val) => `Date: ${val}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  name="Forest Cover"
                  stroke="#2D6A4F" 
                  strokeWidth={3}
                  activeDot={{ r: 8 }} 
                  dot={{ stroke: '#2D6A4F', strokeWidth: 2, fill: 'white' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
