import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import '../dashboards/dashboard.css';

import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix leaflet default icon
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow
});
L.Marker.prototype.options.icon = DefaultIcon;

// Center map helper
const MapEffect = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

interface Region {
  region_id: number;
  region_name: string;
  region_type: string;
  geo_boundary: string | null;
}

export default function SearchMap() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Region[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  // Default roughly over global or south america 
  const [mapCenter, setMapCenter] = useState<[number, number]>([-10, -55]);

  const acctType = localStorage.getItem('acct_type');
  const dashboardLink = acctType === 'Guest' ? '/dashboard/guest' : '/dashboard/viewer';

  const searchRegions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) { setResults([]); return; }
    try {
      const res = await fetch(`http://localhost:8000/regions/search/${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      } else {
        setResults([]);
      }
    } catch (e) {
      console.error(e);
      setResults([]);
    }
  };

  const handleSelect = (r: Region) => {
    setSelectedRegion(r);
    if (r.geo_boundary) {
      const parts = r.geo_boundary.split(',');
      if (parts.length === 2 && !isNaN(parseFloat(parts[0])) && !isNaN(parseFloat(parts[1]))) {
        setMapCenter([parseFloat(parts[0]), parseFloat(parts[1])]);
      }
    }
  };

  const handleSubscribe = async (regionId: number) => {
    const userIdStr = localStorage.getItem('user_id');
    if (!userIdStr) {
      alert("Must be logged in properly to subscribe!");
      return;
    }
    const token = localStorage.getItem('token');
    const payload = {
      user_id: parseInt(userIdStr),
      metric_id: 1, 
      region_id: regionId,
      active: true
    };

    try {
      const res = await fetch('http://localhost:8000/subscriptions/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        alert("Subscribed successfully!");
      } else {
        const body = await res.json();
        if (body.detail === "User already subscribed to this metric in region") {
           alert("You are already subscribed to this region.");
        } else {
           alert("Subscription failed");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
    }
  };

  return (
    <div className="page home-page" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "1rem 2rem", width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
        <Link to={dashboardLink} style={{ color: "#2D6A4F", textDecoration: "none", fontWeight: "bold" }}>← Back to Dashboard</Link>
      </div>
      
      <div style={{ display: "flex", flex: 1, overflow: "hidden", padding: "1rem", gap: "1rem", maxWidth: "1200px", width: "100%", margin: "0 auto", marginBottom: "2rem" }}>
        
        {/* Sidebar */}
        <div style={{ width: "380px", background: "rgba(255,255,255,0.7)", borderRadius: "16px", padding: "1.5rem", display: "flex", flexDirection: "column", boxShadow: "0 12px 30px rgba(0,0,0,0.05)" }}>
          <h2 style={{ marginTop: 0, color: "#1b4332", fontSize: "1.4rem" }}>Search Regions</h2>
          <form onSubmit={searchRegions} style={{ display: "flex", gap: "8px", marginBottom: "1rem" }}>
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Example: Amazon, Congo..." 
              style={{ flex: 1, padding: "10px 14px", borderRadius: "8px", border: "1px solid #ccc" }}
            />
            <button type="submit" style={{ padding: "10px 18px", background: "#2D6A4F", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>Search</button>
          </form>

          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", paddingRight: "4px" }}>
            {results.map(r => (
              <div 
                key={r.region_id} 
                onClick={() => handleSelect(r)}
                style={{ 
                  background: selectedRegion?.region_id === r.region_id ? "#E6E1D6" : "rgba(255,255,255,0.9)",
                  padding: "1.2rem", 
                  borderRadius: "12px", 
                  cursor: "pointer",
                  border: selectedRegion?.region_id === r.region_id ? "2px solid #2D6A4F" : "2px solid transparent",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.03)",
                  transition: "all 0.2s"
                }}
              >
                <div style={{ fontWeight: "800", color: "#1b4332", fontSize: "1.1rem" }}>{r.region_name}</div>
                <div style={{ fontSize: "0.85rem", color: "#5C6E61", marginBottom: "12px", marginTop: "4px" }}>Type: {r.region_type}</div>
                {localStorage.getItem('user_id') && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleSubscribe(r.region_id); }}
                    style={{ background: "#1b4332", color: "white", border: "none", padding: "8px 14px", borderRadius: "6px", fontSize: "0.85rem", cursor: "pointer", fontWeight: "600", width: "100%" }}
                  >
                    Save Region
                  </button>
                )}
              </div>
            ))}
            {results.length === 0 && <p style={{ color: "#888", textAlign: "center", marginTop: "2rem" }}>No results found.</p>}
          </div>
        </div>

        {/* Map Area */}
        <div style={{ flex: 1, borderRadius: "16px", overflow: "hidden", border: "4px solid white", boxShadow: "0 12px 30px rgba(0,0,0,0.08)" }}>
          <MapContainer center={mapCenter} zoom={4} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapEffect center={mapCenter} />
            {selectedRegion && (
              <Marker position={mapCenter}>
                <Popup>{selectedRegion.region_name}</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

      </div>
    </div>
  );
}
