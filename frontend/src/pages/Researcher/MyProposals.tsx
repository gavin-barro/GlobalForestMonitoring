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

export default function MyProposals() {
  const navigate = useNavigate();
  const userIdStr = localStorage.getItem('user_id');
  
  const [proposals, setProposals] = useState<PendingUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kick non-researchers or missing sessions
    if (localStorage.getItem('acct_type') !== 'Researcher') {
      navigate('/dashboard/viewer');
      return;
    }

    let finalUserIdStr = userIdStr;
    if (!finalUserIdStr && localStorage.getItem('username')?.toLowerCase() === 'researcher') {
        finalUserIdStr = '0';
    }

    if (finalUserIdStr) {
      fetch(`http://localhost:8000/pending_updates/submitting_user_id/${finalUserIdStr}`)
        .then(res => res.ok ? res.json() : [])
        .then(data => {
            // Sort by most recent first
            const sortedData = data.sort((a: PendingUpdate, b: PendingUpdate) => 
                new Date(b.submit_date).getTime() - new Date(a.submit_date).getTime()
            );
            setProposals(sortedData);
            setLoading(false);
        })
        .catch(err => {
            console.error(err);
            setProposals([]);
            setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [navigate, userIdStr]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Approved': return { bg: '#e8f5e9', text: '#2e7d32', border: '#a5d6a7' };
      case 'Rejected': return { bg: '#ffebee', text: '#c62828', border: '#ef9a9a' };
      case 'Withdrawn': return { bg: '#f5f5f5', text: '#616161', border: '#e0e0e0' };
      default: return { bg: '#fff8e1', text: '#f57f17', border: '#ffe082' }; // Pending
    }
  };

  return (
    <div className="page home-page" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "1rem 2rem", width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
        <Link to="/dashboard/researcher" style={{ color: "#2D6A4F", textDecoration: "none", fontWeight: "bold" }}>← Back to Dashboard</Link>
      </div>

      <div style={{ flex: 1, padding: "2rem", maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
          <h1 style={{ color: "#1b4332", fontSize: "2.5rem", margin: 0 }}>My Proposals</h1>
          <Link 
            to="/dashboard/researcher/suggest-update" 
            style={{ padding: "8px 16px", background: "#2D6A4F", color: "white", borderRadius: "8px", textDecoration: "none", fontWeight: "bold", fontSize: "0.95rem" }}
          >
            + New Proposal
          </Link>
        </div>
        <p style={{ color: "#5C6E61", fontSize: "1.1rem", marginBottom: "2rem" }}>Track the review status of your submitted data updates.</p>

        {loading ? (
          <p>Loading proposals...</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {proposals.map(p => {
              const colors = getStatusColor(p.status);
              return (
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
                      <div style={{ color: "#888", fontSize: "0.85rem", marginBottom: "4px" }}>Submitted: {new Date(p.submit_date).toLocaleDateString()}</div>
                      <div style={{ color: "#1b4332", fontSize: "1.2rem", fontWeight: "bold" }}>Proposed Value: {p.proposed_value}</div>
                    </div>
                    <div style={{ 
                      background: colors.bg, 
                      color: colors.text, 
                      border: `1px solid ${colors.border}`,
                      padding: "4px 12px", 
                      borderRadius: "9999px", 
                      fontWeight: "bold", 
                      fontSize: "0.85rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>
                      {p.status}
                    </div>
                  </div>
                  
                  <div style={{ background: "#F9F9F9", padding: "1rem", borderRadius: "8px", border: "1px solid #EEE" }}>
                    <div style={{ color: "#555", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "4px" }}>Justification / Notes:</div>
                    <div style={{ color: "#333", fontSize: "0.95rem", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                      {p.reason}
                    </div>
                  </div>
                </div>
              );
            })}
            {proposals.length === 0 && (
              <div style={{ textAlign: "center", padding: "3rem", background: "rgba(255,255,255,0.5)", borderRadius: "16px", border: "2px dashed rgba(255,255,255,0.8)" }}>
                <p style={{ color: "#5C6E61", fontSize: "1.1rem", marginBottom: "1rem" }}>You haven't submitted any proposals yet.</p>
                <Link to="/dashboard/researcher/suggest-update" style={{ color: "#2D6A4F", fontWeight: "bold", textDecoration: "none", borderBottom: "1px solid #2D6A4F" }}>Create your first proposal →</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
