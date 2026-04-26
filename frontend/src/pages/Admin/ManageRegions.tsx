import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllRegions, requestCreateRegion, requestDeleteRegion } from "../../services";
import type { Region } from "../../types";
import '../dashboards/dashboard.css';

export default function ManageRegions() {
   const navigate = useNavigate();
   const [activeTab, setActiveTab] = useState<'view' | 'add'>('view');

   const [regions, setRegions] = useState<Region[]>([]);
   const [loading, setLoading] = useState(true);

   // Form State
   const [formName, setFormName] = useState('');
   const [formType, setFormType] = useState('Country');
   const [formGeo, setFormGeo] = useState('');
   const [formParentId, setFormParentId] = useState('');
   const [isSubmitting, setIsSubmitting] = useState(false);

   useEffect(() => {
      if (localStorage.getItem('acct_type') !== 'Administrator' && localStorage.getItem('acct_type') !== 'Admin') {
         navigate('/');
         return;
      }

      getAllRegions().then(result => {
         setRegions(result);
         setLoading(false);
      });
   }, [navigate]);

   const handleDelete = async (id: number) => {
      if (!window.confirm("Are you sure you want to delete this region? All associated sub-regions and dependencies may be affected.")) return;
      const success = await requestDeleteRegion(id);
      if (success) {
         setRegions((prev) => prev.filter((r) => r.region_id !== id));
      } else {
         alert("Failed to delete region. It may be heavily attached to other data sources.");
      }
   };

   const handleAddSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formName) {
         alert("Region Name is required.");
         return;
      }

      setIsSubmitting(true);
      const newRegion: Region = {
         region_id: 0, // Auto-assigned by backend
         region_name: formName,
         region_type: formType,
         geo_boundary: formGeo || null,
         parent_region_id: formParentId ? parseInt(formParentId) : null
      };

      const success = await requestCreateRegion(newRegion);
      if (success) {
         alert("Region added successfully.");
         getAllRegions().then(setRegions);
         setFormName(''); setFormType('Country'); setFormGeo(''); setFormParentId('');
         setActiveTab('view');
      } else {
         alert("Error adding region.");
      }
      setIsSubmitting(false);
   };

   return (
      <div className="page home-page" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
         <div style={{ padding: "1rem 2rem", width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
            <Link to="/dashboard/admin" style={{ color: "#2D6A4F", textDecoration: "none", fontWeight: "bold" }}>← Back to Dashboard</Link>
         </div>

         <div style={{ flex: 1, padding: "2rem", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
               <h1 style={{ color: "#1b4332", fontSize: "2.5rem", margin: 0 }}>Region Geography Management</h1>
               <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                     onClick={() => setActiveTab('view')}
                     style={{ padding: "8px 16px", borderRadius: "8px", border: "none", fontWeight: "bold", cursor: "pointer", background: activeTab === 'view' ? "#2D6A4F" : "#E6E1D6", color: activeTab === 'view' ? "white" : "#1b4332" }}
                  >
                     Active Regions
                  </button>
                  <button
                     onClick={() => setActiveTab('add')}
                     style={{ padding: "8px 16px", borderRadius: "8px", border: "none", fontWeight: "bold", cursor: "pointer", background: activeTab === 'add' ? "#2D6A4F" : "#E6E1D6", color: activeTab === 'add' ? "white" : "#1b4332" }}
                  >
                     + Define Region
                  </button>
               </div>
            </div>
            <p style={{ color: "#5C6E61", fontSize: "1.1rem", marginBottom: "2rem" }}>Add or delete searchable regions, countries, and coordinate boundaries inside the database.</p>

            {loading ? (
               <p>Loading regions...</p>
            ) : activeTab === 'view' ? (
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                  {regions.map((r) => (
                     <div key={r.region_id} style={{
                        background: "rgba(255,255,255,0.85)",
                        backdropFilter: "blur(10px)",
                        padding: "1.5rem",
                        borderRadius: "16px",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
                        border: "1px solid rgba(255,255,255,0.7)"
                     }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                           <div>
                              <h3 style={{ margin: 0, color: "#1b4332", fontSize: "1.3rem" }}>{r.region_name}</h3>
                              <div style={{ fontSize: "0.9rem", color: "#555", marginTop: "4px" }}>Type: {r.region_type}</div>
                           </div>
                           <span style={{
                              background: '#e8f5e9',
                              color: '#2e7d32',
                              padding: "4px 8px", borderRadius: "8px", fontSize: "0.8rem", fontWeight: "bold"
                           }}>
                              ID: {r.region_id}
                           </span>
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "#888", marginBottom: "1.5rem" }}>
                           Geo Boundary: {r.geo_boundary ? "Yes" : "No"} <br />
                           Parent: {r.parent_region_id || "None"}
                        </div>
                        <button
                           onClick={() => handleDelete(r.region_id)}
                           style={{ width: "100%", padding: "10px", background: "#ffebee", color: "#c62828", border: "1px solid #ef9a9a", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
                        >
                           Delete Region
                        </button>
                     </div>
                  ))}
               </div>
            ) : (
               <div style={{ maxWidth: "600px" }}>
                  <form onSubmit={handleAddSubmit} style={{
                     background: "rgba(255,255,255,0.85)",
                     backdropFilter: "blur(10px)",
                     padding: "2rem",
                     borderRadius: "16px",
                     boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
                     border: "1px solid rgba(255,255,255,0.7)",
                     display: "flex", flexDirection: "column", gap: "1.5rem"
                  }}>
                     <h3 style={{ margin: 0, color: "#1b4332", fontSize: "1.5rem" }}>Create New Geography</h3>

                     <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label style={{ fontWeight: "600", color: "#1b4332" }}>Region Name</label>
                        <input type="text" value={formName} onChange={e => setFormName(e.target.value)} required placeholder="EX: Amazon Rainforest" style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ccc", background: "white" }} />
                     </div>

                     <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label style={{ fontWeight: "600", color: "#1b4332" }}>Classification</label>
                        <input type="text" value={formType} onChange={e => setFormType(e.target.value)} required placeholder="EX: Country, State, Basin" style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ccc", background: "white" }} />
                     </div>

                     <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label style={{ fontWeight: "600", color: "#1b4332" }}>Parent Region (Optional)</label>
                        <select value={formParentId} onChange={e => setFormParentId(e.target.value)} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ccc", background: "white" }}>
                           <option value="">None (Independent Region)</option>
                           {regions.map(r => <option key={r.region_id} value={r.region_id}>{r.region_name}</option>)}
                        </select>
                     </div>

                     <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label style={{ fontWeight: "600", color: "#1b4332" }}>GeoJSON Coordinates (Optional)</label>
                        <textarea value={formGeo} onChange={e => setFormGeo(e.target.value)} placeholder="Wait to implement..." rows={3} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ccc", background: "white" }} />
                     </div>

                     <button type="submit" disabled={isSubmitting} style={{ marginTop: "1rem", padding: "14px", background: "#2D6A4F", color: "white", border: "none", borderRadius: "8px", cursor: isSubmitting ? "not-allowed" : "pointer", fontWeight: "bold", fontSize: "1.1rem" }}>
                        {isSubmitting ? "Adding..." : "Add Region"}
                     </button>
                  </form>
               </div>
            )}
         </div>
      </div>
   );
}
