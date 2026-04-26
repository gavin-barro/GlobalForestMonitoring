import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../dashboards/dashboard.css';

interface PendingUpdate {
  update_id: number;
  submit_date: string;
  proposed_value: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Withdrawn';
  submitting_user_id: number;
}

export default function PendingApprovals() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [proposals, setProposals] = useState<PendingUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchPending = async () => {
    try {
      const res = await fetch(`http://localhost:8000/pending_updates/`);
      if (res.ok) {
        let data: PendingUpdate[] = await res.json();
        // Filter strictly to pending proposals
        data = data.filter((pu) => pu.status === 'Pending');
        // Sort oldest first (FIFO)
        data.sort((a, b) => new Date(a.submit_date).getTime() - new Date(b.submit_date).getTime());
        setProposals(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('acct_type') !== 'Administrator' && localStorage.getItem('acct_type') !== 'Admin') {
      navigate('/');
      return;
    }
    fetchPending();
  }, [navigate]);

  const handleApprove = async (id: number) => {
    setActionLoading(id);
    try {
      const res = await fetch(`http://localhost:8000/pending_updates/approve/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        // Just refetch or manually remove
        setProposals(prev => prev.filter(p => p.update_id !== id));
      } else {
        alert("Failed to approve update.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number) => {
    setActionLoading(id);
    try {
      const payload = { status: "Rejected" };
      const res = await fetch(`http://localhost:8000/pending_updates/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setProposals(prev => prev.filter(p => p.update_id !== id));
      } else {
        alert("Failed to reject update.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="page home-page" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "1rem 2rem", width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
        <Link to="/dashboard/admin" style={{ color: "#2D6A4F", textDecoration: "none", fontWeight: "bold" }}>← Back to Dashboard</Link>
      </div>

      <div style={{ flex: 1, padding: "2rem", maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
        <h1 style={{ color: "#1b4332", fontSize: "2.5rem", marginBottom: "0.5rem" }}>Pending Data Approvals</h1>
        <p style={{ color: "#5C6E61", fontSize: "1.1rem", marginBottom: "2rem" }}>Review and authorize dataset updates proposed by verified Researchers.</p>

        {loading ? (
          <p>Loading proposals...</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {proposals.map(p => (
              <div key={p.update_id} style={{ 
                background: "rgba(255,255,255,0.85)", 
                backdropFilter: "blur(10px)", 
                padding: "1.5rem", 
                borderRadius: "16px", 
                boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
                border: "1px solid rgba(255,255,255,0.7)",
                display: "flex",
                flexDirection: "column",
                gap: "1rem"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ color: "#888", fontSize: "0.85rem", marginBottom: "4px" }}>Submitted: {new Date(p.submit_date).toLocaleDateString()} by User {p.submitting_user_id}</div>
                    <div style={{ color: "#1b4332", fontSize: "1.3rem", fontWeight: "bold" }}>Proposed Value: {p.proposed_value}</div>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button 
                      onClick={() => handleReject(p.update_id)}
                      disabled={actionLoading === p.update_id}
                      style={{ padding: "8px 16px", background: "#ffebee", color: "#c62828", border: "1px solid #ef9a9a", borderRadius: "8px", fontWeight: "bold", cursor: actionLoading === p.update_id ? "not-allowed" : "pointer" }}
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => handleApprove(p.update_id)}
                      disabled={actionLoading === p.update_id}
                      style={{ padding: "8px 16px", background: "#e8f5e9", color: "#2e7d32", border: "1px solid #a5d6a7", borderRadius: "8px", fontWeight: "bold", cursor: actionLoading === p.update_id ? "not-allowed" : "pointer" }}
                    >
                      Approve
                    </button>
                  </div>
                </div>
                
                <div style={{ background: "#F9F9F9", padding: "1rem", borderRadius: "8px", border: "1px solid #EEE" }}>
                  <div style={{ color: "#555", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "4px" }}>Researcher Justification / Target Info:</div>
                  <div style={{ color: "#333", fontSize: "0.95rem", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                    {p.reason}
                  </div>
                </div>
              </div>
            ))}
            {proposals.length === 0 && (
              <div style={{ textAlign: "center", padding: "3rem", background: "rgba(255,255,255,0.5)", borderRadius: "16px", border: "2px dashed rgba(255,255,255,0.8)" }}>
                <p style={{ color: "#5C6E61", fontSize: "1.1rem", marginBottom: "1rem" }}>Queue is empty. No pending proposals.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
