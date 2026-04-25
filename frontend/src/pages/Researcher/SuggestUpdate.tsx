import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllRegions, getAllMetrics } from '../../services';
import type { Region, Metric } from '../../types';
import '../dashboards/dashboard.css';

export default function SuggestUpdate() {
  const navigate = useNavigate();
  const userIdStr = localStorage.getItem('user_id');

  const [regions, setRegions] = useState<Region[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);

  const [selectedRegionId, setSelectedRegionId] = useState<string>('');
  const [selectedMetricId, setSelectedMetricId] = useState<string>('');
  const [proposedValue, setProposedValue] = useState<string>('');
  const [justification, setJustification] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Kick non-researchers or missing sessions
    if (localStorage.getItem('acct_type') !== 'Researcher') {
      navigate('/dashboard/viewer');
    }

    getAllRegions().then(setRegions);
    getAllMetrics().then(setMetrics);
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRegionId || !selectedMetricId || !proposedValue || !justification) {
      alert("Please fill out all fields.");
      return;
    }

    let finalUserId = parseInt(userIdStr || '-1', 10);
    // Handle Dev Quick Login bypass where user_id isn't saved properly
    if (!userIdStr && localStorage.getItem('username')?.toLowerCase() === 'researcher') {
      finalUserId = 0; // Default researcher ID in the demo database
    } else if (finalUserId === -1) {
      alert("Error: You must be fully logged in to submit an update.");
      return;
    }

    setIsSubmitting(true);

    const regionName = regions.find(r => r.region_id.toString() === selectedRegionId)?.region_name || 'Unknown';
    const metricName = metrics.find(m => m.metric_id.toString() === selectedMetricId)?.metric_name || 'Unknown';

    // We neatly pack the contextual info into the reason text string for the admin to easily review
    const contextPrefix = `[Region: ${regionName}] [Metric: ${metricName}]\n`;
    const fullReason = contextPrefix + justification;

    const payload = {
      submit_date: new Date().toISOString().slice(0, 19),
      proposed_value: parseFloat(proposedValue),
      reason: fullReason,
      status: "Pending",
      submitting_user_id: finalUserId,
      observation_id: null
    };

    try {
      const res = await fetch('http://localhost:8000/pending_updates/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Proposal submitted successfully!");
        navigate('/dashboard/researcher/my-updates');
      } else {
        alert("Failed to submit proposal.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page home-page" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "1rem 2rem", width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
        <Link to="/dashboard/researcher" style={{ color: "#2D6A4F", textDecoration: "none", fontWeight: "bold" }}>← Back to Dashboard</Link>
      </div>

      <div style={{ flex: 1, padding: "2rem", maxWidth: "800px", margin: "0 auto", width: "100%" }}>
        <h1 style={{ color: "#1b4332", fontSize: "2.5rem", marginBottom: "0.5rem" }}>Propose Data Update</h1>
        <p style={{ color: "#5C6E61", fontSize: "1.1rem", marginBottom: "2rem" }}>Submit new forest observations for Administrator review and integration.</p>

        <form onSubmit={handleSubmit} style={{
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(10px)",
          padding: "2rem",
          borderRadius: "16px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
          border: "1px solid rgba(255,255,255,0.5)",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem"
        }}>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontWeight: "600", color: "#1b4332" }}>Target Region</label>
            <select
              value={selectedRegionId}
              onChange={e => setSelectedRegionId(e.target.value)}
              style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ccc", background: "white" }}
              required
            >
              <option value="" disabled>Select a region...</option>
              {regions.map(r => (
                <option key={r.region_id} value={r.region_id}>{r.region_name} ({r.region_type})</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontWeight: "600", color: "#1b4332" }}>Target Metric</label>
            <select
              value={selectedMetricId}
              onChange={e => setSelectedMetricId(e.target.value)}
              style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ccc", background: "white" }}
              required
            >
              <option value="" disabled>Select a metric...</option>
              {metrics.map(m => (
                <option key={m.metric_id} value={m.metric_id}>{m.metric_name} ({m.unit})</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontWeight: "600", color: "#1b4332" }}>Proposed Value</label>
            <input
              type="number"
              step="any"
              value={proposedValue}
              onChange={e => setProposedValue(e.target.value)}
              placeholder="EX: 15000"
              style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ccc", background: "white" }}
              required
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontWeight: "600", color: "#1b4332" }}>Research Justification / Notes</label>
            <textarea
              value={justification}
              onChange={e => setJustification(e.target.value)}
              placeholder="Detail your methodology, sources, or any context needed for the admin to verify this proposal."
              style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ccc", background: "white", minHeight: "120px", resize: "vertical" }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              marginTop: "1rem",
              padding: "14px",
              background: "#2D6A4F",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              fontWeight: "bold",
              fontSize: "1.1rem"
            }}
          >
            {isSubmitting ? "Submitting..." : "Submit Proposal"}
          </button>
        </form>
      </div>
    </div>
  );
}
