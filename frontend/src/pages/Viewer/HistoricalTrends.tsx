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

export default function HistoricalTrends() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const regionId = searchParams.get('region_id');
  const regionName = searchParams.get('region_name') || 'Selected Region';

  const [data, setData] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!regionId) {
      setLoading(false);
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

  return (
    <div className="page home-page" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "1rem 2rem", width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
        <Link to="/dashboard/viewer/saved" style={{ color: "#2D6A4F", textDecoration: "none", fontWeight: "bold" }}>← Back to Saved Regions</Link>
      </div>

      <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        <h1 style={{ color: "#1b4332", fontSize: "2.5rem", marginTop: "1.5rem" }}>Historical Trends for {regionName}</h1>
        <p style={{ color: "#5C6E61", fontSize: "1.1rem", marginBottom: "2rem" }}>Analyzing forest cover changes over time based on historical observations.</p>

        {!regionId ? (
          <div style={{ padding: "2rem", background: "white", borderRadius: "12px", textAlign: "center" }}>
            <p>No region specified. Please select a region from your Saved Regions.</p>
          </div>
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
