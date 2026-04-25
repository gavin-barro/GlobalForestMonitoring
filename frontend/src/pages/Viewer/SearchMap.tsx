import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON } from 'react-leaflet';
import { Link, useLocation } from 'react-router-dom';
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
    map.flyTo(center, 4, { animate: true, duration: 1.5 });
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
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialQuery = searchParams.get('query') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Region[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  // Default roughly over global or south america 
  const [mapCenter, setMapCenter] = useState<[number, number]>([-10, -55]);
  const [allPins, setAllPins] = useState<Region[]>([]);
  const [subscribedRegionIds, setSubscribedRegionIds] = useState<Set<number>>(new Set());

  const acctType = localStorage.getItem('acct_type');
  let dashboardLink = '/dashboard/viewer';
  if (acctType === 'Guest') dashboardLink = '/dashboard/guest';
  if (acctType === 'Researcher') dashboardLink = '/dashboard/researcher';

  // Fetch either specific query or all regions on load
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        let url = `http://localhost:8000/regions/`;
        if (initialQuery) {
          url = `http://localhost:8000/regions/search/${encodeURIComponent(initialQuery)}`;
        }
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          
          // Also set map pins to show all returned results
          setAllPins(data.filter((r: Region) => r.geo_boundary !== null));

          // If there's an initial query and a match, auto-select the first one
          if (initialQuery && data.length > 0) {
            handleSelect(data[0]);
          }
        }

        // Fetch subscriptions if logged in
        const userIdStr = localStorage.getItem('user_id');
        let finalUserIdStr = userIdStr;
        if (!finalUserIdStr && acctType?.toLowerCase() === 'researcher') {
            finalUserIdStr = '0';
        }
        if (finalUserIdStr) {
          const subRes = await fetch(`http://localhost:8000/subscriptions/by-user/${finalUserIdStr}`);
          if (subRes.ok) {
             const subData = await subRes.json();
             const ids = new Set(subData.map((s: any) => s.region_id));
             setSubscribedRegionIds(ids as Set<number>);
          }
        }

      } catch (e) {
        console.error(e);
      }
    };
    fetchInitial();
  }, [initialQuery]);

  const searchRegions = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let url = `http://localhost:8000/regions/`;
      if (query) {
         url = `http://localhost:8000/regions/search/${encodeURIComponent(query)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
        setAllPins(data.filter((r: Region) => r.geo_boundary !== null));
      } else {
        setResults([]);
        setAllPins([]);
      }
    } catch (e) {
      console.error(e);
      setResults([]);
      setAllPins([]);
    }
  };

  const handleSelect = (r: Region) => {
    setSelectedRegion(r);
    if (!r.geo_boundary) return;

    if (r.geo_boundary.trim().startsWith('{')) {
      try {
        const match = r.geo_boundary.match(/\[\s*([-\d\.]+)\s*,\s*([-\d\.]+)\s*\]/);
        if (match) {
          const lng = parseFloat(match[1]);
          const lat = parseFloat(match[2]);
          if (!isNaN(lat) && !isNaN(lng)) {
            setMapCenter([lat, lng]);
          }
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      const parts = r.geo_boundary.split(',');
      if (parts.length === 2) {
        const lat = parseFloat(parts[0]);
        const lng = parseFloat(parts[1]);
        if (!isNaN(lat) && !isNaN(lng)) {
          setMapCenter([lat, lng]);
        }
      }
    }
  };

  const handleSubscribe = async (regionId: number) => {
    let userIdStr = localStorage.getItem('user_id');
    if (!userIdStr && acctType?.toLowerCase() === 'researcher') userIdStr = '0';
    
    if (!userIdStr) {
      alert("Must be logged in properly to subscribe!");
      return;
    }
    const token = localStorage.getItem('token');
    
    const isSubscribed = subscribedRegionIds.has(regionId);
    if (isSubscribed) {
       try {
         const res = await fetch(`http://localhost:8000/subscriptions/${userIdStr}/1/${regionId}`, {
           method: 'DELETE',
           headers: { 'Authorization': `Bearer ${token}` }
         });
         if (res.ok || res.status === 204) {
             setSubscribedRegionIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(regionId);
                return newSet;
             });
         } else {
             alert("Failed to unsubscribe");
         }
       } catch (err) {
           console.error(err);
       }
       return;
    }

    const payload = {
      user_id: parseInt(userIdStr, 10),
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
        setSubscribedRegionIds(prev => new Set(prev).add(regionId));
      } else {
        const body = await res.json();
        if (body.detail === "User already subscribed to this metric in region") {
           setSubscribedRegionIds(prev => new Set(prev).add(regionId));
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
                <div style={{ display: 'flex', gap: '8px' }}>
                  {acctType && acctType !== 'Guest' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleSubscribe(r.region_id); }}
                      style={{ 
                        flex: 1, 
                        background: subscribedRegionIds.has(r.region_id) ? "rgba(220, 53, 69, 0.1)" : "#1b4332", 
                        color: subscribedRegionIds.has(r.region_id) ? "#dc3545" : "white", 
                        border: subscribedRegionIds.has(r.region_id) ? "1px solid #dc3545" : "none", 
                        padding: "8px 14px", 
                        borderRadius: "6px", 
                        fontSize: "0.85rem", 
                        cursor: "pointer", 
                        fontWeight: "600" 
                      }}
                    >
                      {subscribedRegionIds.has(r.region_id) ? "Unsave Region" : "Save Region"}
                    </button>
                  )}
                  <Link 
                    to={`/dashboard/viewer/historical?region_id=${r.region_id}&region_name=${encodeURIComponent(r.region_name)}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{ flex: 1, textAlign: 'center', background: "#E6E1D6", color: "#1b4332", border: "1px solid #1b4332", padding: "8px 14px", borderRadius: "6px", fontSize: "0.85rem", cursor: "pointer", fontWeight: "600", textDecoration: "none" }}
                  >
                    View Trends
                  </Link>
                </div>
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
            {allPins.map(r => {
              if (!r.geo_boundary) return null;

              if (r.geo_boundary.trim().startsWith('{')) {
                try {
                  const data = JSON.parse(r.geo_boundary);
                  return (
                    <GeoJSON 
                      key={r.region_id + (selectedRegion?.region_id === r.region_id ? '-active' : '')}
                      data={data} 
                      eventHandlers={{ click: () => handleSelect(r) }}
                      pathOptions={{
                        color: selectedRegion?.region_id === r.region_id ? '#1b4332' : '#2D6A4F',
                        weight: selectedRegion?.region_id === r.region_id ? 3 : 1,
                        fillOpacity: selectedRegion?.region_id === r.region_id ? 0.3 : 0.05
                      }}
                    >
                      <Popup>{r.region_name}</Popup>
                    </GeoJSON>
                  );
                } catch(e) {
                  return null;
                }
              }

              const parts = r.geo_boundary.split(',');
              if (parts.length !== 2) return null;
              const lat = parseFloat(parts[0]);
              const lng = parseFloat(parts[1]);
              if (isNaN(lat) || isNaN(lng)) return null;
              return (
                <Marker key={r.region_id} position={[lat, lng]} eventHandlers={{ click: () => handleSelect(r) }}>
                  {selectedRegion?.region_id === r.region_id && (
                    <Popup>{r.region_name}</Popup>
                  )}
                </Marker>
              );
            })}
          </MapContainer>
        </div>

      </div>
    </div>
  );
}
