import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllForestObservations, getAllMetrics, getAllRegions, getAllTimePeriods, requestCreateForestObservation, requestDeleteForestObservation } from "../../services";
import type { ForestObservationGet, Metric, Region, TimePeriod, ForestObservationFormBackend } from "../../types";
import { getMetricName, getRegionName, getTimePeriodName } from "../../utils";
import '../dashboards/dashboard.css';

export default function DataManagement() {
   const navigate = useNavigate();
   const [activeTab, setActiveTab] = useState<'view' | 'add'>('view');

   const [forestObservations, setForestObservations] = useState<ForestObservationGet[]>([]);
   const [timePeriods, setTimePeriods] = useState<TimePeriod[]>([]);
   const [metrics, setMetrics] = useState<Metric[]>([]);
   const [regions, setRegions] = useState<Region[]>([]);
   const [loading, setLoading] = useState(true);

   // Form State
   const [formValue, setFormValue] = useState('');
   const [formSourceDate, setFormSourceDate] = useState('');
   const [formPeriodId, setFormPeriodId] = useState('');
   const [formMetricId, setFormMetricId] = useState('');
   const [formRegionId, setFormRegionId] = useState('');
   const [isSubmitting, setIsSubmitting] = useState(false);

   useEffect(() => {
      if (localStorage.getItem('acct_type') !== 'Administrator' && localStorage.getItem('acct_type') !== 'Admin') {
         navigate('/');
         return;
      }

      Promise.all([
         getAllForestObservations().then(setForestObservations),
         getAllTimePeriods().then(setTimePeriods),
         getAllMetrics().then(setMetrics),
         getAllRegions().then(setRegions)
      ]).then(() => setLoading(false));
   }, [navigate]);

   const handleDelete = async (id: number) => {
      if (!window.confirm("Are you sure you want to delete this observation?")) return;
      const success = await requestDeleteForestObservation(id);
      if (success) {
         setForestObservations((prev) => prev.filter((fo) => fo.observation_id !== id));
      } else {
         alert("Failed to delete observation.");
      }
   };

   const handleAddSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formValue || !formSourceDate || !formPeriodId || !formMetricId || !formRegionId) {
         alert("All fields are required.");
         return;
      }

      setIsSubmitting(true);
      const newForestObservation: ForestObservationFormBackend = {
         value: parseFloat(formValue),
         source_date: formSourceDate,
         period_id: parseInt(formPeriodId),
         metric_id: parseInt(formMetricId),
         region_id: parseInt(formRegionId)
      };

      const success = await requestCreateForestObservation(newForestObservation);
      if (success) {
         alert("Observation added successfully.");
         // Refresh list
         getAllForestObservations().then(setForestObservations);
         // Clear form and switch tab
         setFormValue(''); setFormSourceDate(''); setFormPeriodId(''); setFormMetricId(''); setFormRegionId('');
         setActiveTab('view');
      } else {
         alert("Error adding observation.");
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
               <h1 style={{ color: "#1b4332", fontSize: "2.5rem", margin: 0 }}>Data Management</h1>
               <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                     onClick={() => setActiveTab('view')}
                     style={{ padding: "8px 16px", borderRadius: "8px", border: "none", fontWeight: "bold", cursor: "pointer", background: activeTab === 'view' ? "#2D6A4F" : "#E6E1D6", color: activeTab === 'view' ? "white" : "#1b4332" }}
                  >
                     Manage Records
                  </button>
                  <button
                     onClick={() => setActiveTab('add')}
                     style={{ padding: "8px 16px", borderRadius: "8px", border: "none", fontWeight: "bold", cursor: "pointer", background: activeTab === 'add' ? "#2D6A4F" : "#E6E1D6", color: activeTab === 'add' ? "white" : "#1b4332" }}
                  >
                     + Add Data Point
                  </button>
               </div>
            </div>
            <p style={{ color: "#5C6E61", fontSize: "1.1rem", marginBottom: "2rem" }}>Directly modify global observation records.</p>

            {loading ? (
               <p>Loading records...</p>
            ) : activeTab === 'view' ? (
               <div style={{
                  background: "rgba(255,255,255,0.85)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "16px",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
                  border: "1px solid rgba(255,255,255,0.7)",
                  overflow: "hidden"
               }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                     <thead>
                        <tr style={{ background: "#E6E1D6", color: "#1b4332" }}>
                           <th style={{ padding: "16px", fontWeight: "bold" }}>ID</th>
                           <th style={{ padding: "16px", fontWeight: "bold" }}>Region</th>
                           <th style={{ padding: "16px", fontWeight: "bold" }}>Metric</th>
                           <th style={{ padding: "16px", fontWeight: "bold" }}>Period</th>
                           <th style={{ padding: "16px", fontWeight: "bold" }}>Value</th>
                           <th style={{ padding: "16px", fontWeight: "bold" }}>Actions</th>
                        </tr>
                     </thead>
                     <tbody>
                        {forestObservations.map((fo) => (
                           <tr key={fo.observation_id} style={{ borderBottom: "1px solid #EEE" }}>
                              <td style={{ padding: "16px", color: "#666" }}>{fo.observation_id}</td>
                              <td style={{ padding: "16px", fontWeight: "600", color: "#333" }}>{getRegionName(regions, fo.region_id)}</td>
                              <td style={{ padding: "16px", color: "#555" }}>{getMetricName(metrics, fo.metric_id)}</td>
                              <td style={{ padding: "16px", color: "#555" }}>{getTimePeriodName(timePeriods, fo.period_id)}</td>
                              <td style={{ padding: "16px", fontWeight: "bold", color: "#1b4332" }}>{fo.value}</td>
                              <td style={{ padding: "16px" }}>
                                 <button
                                    onClick={() => handleDelete(fo.observation_id)}
                                    style={{ background: "#ffebee", color: "#c62828", border: "1px solid #ef9a9a", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "0.85rem" }}
                                 >
                                    Delete
                                 </button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
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
                     <h3 style={{ margin: 0, color: "#1b4332", fontSize: "1.5rem" }}>Inject New Observation</h3>

                     <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label style={{ fontWeight: "600", color: "#1b4332" }}>Region</label>
                        <select value={formRegionId} onChange={e => setFormRegionId(e.target.value)} required style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ccc", background: "white" }}>
                           <option value="" disabled>Select Region...</option>
                           {regions.map(r => <option key={r.region_id} value={r.region_id}>{r.region_name}</option>)}
                        </select>
                     </div>

                     <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label style={{ fontWeight: "600", color: "#1b4332" }}>Metric</label>
                        <select value={formMetricId} onChange={e => setFormMetricId(e.target.value)} required style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ccc", background: "white" }}>
                           <option value="" disabled>Select Metric...</option>
                           {metrics.map(m => <option key={m.metric_id} value={m.metric_id}>{m.metric_name}</option>)}
                        </select>
                     </div>

                     <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label style={{ fontWeight: "600", color: "#1b4332" }}>Time Period</label>
                        <select value={formPeriodId} onChange={e => setFormPeriodId(e.target.value)} required style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ccc", background: "white" }}>
                           <option value="" disabled>Select Period...</option>
                           {timePeriods.map(p => <option key={p.period_id} value={p.period_id}>{p.period_name}</option>)}
                        </select>
                     </div>

                     <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label style={{ fontWeight: "600", color: "#1b4332" }}>Data Value</label>
                        <input type="number" step="any" value={formValue} onChange={e => setFormValue(e.target.value)} required placeholder="EX: 5000" style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ccc", background: "white" }} />
                     </div>

                     <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label style={{ fontWeight: "600", color: "#1b4332" }}>Observation Match Date</label>
                        <input type="date" value={formSourceDate} onChange={e => setFormSourceDate(e.target.value)} required style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ccc", background: "white" }} />
                     </div>

                     <button type="submit" disabled={isSubmitting} style={{ marginTop: "1rem", padding: "14px", background: "#2D6A4F", color: "white", border: "none", borderRadius: "8px", cursor: isSubmitting ? "not-allowed" : "pointer", fontWeight: "bold", fontSize: "1.1rem" }}>
                        {isSubmitting ? "Injecting..." : "Inject Data"}
                     </button>
                  </form>
               </div>
            )}
         </div>
      </div>
   );
}
