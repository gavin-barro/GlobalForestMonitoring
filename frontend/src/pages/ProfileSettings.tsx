import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './dashboards/dashboard.css';

export default function ProfileSettings() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');
  const userId = localStorage.getItem('user_id');
  const token = localStorage.getItem('token');
  const acctType = localStorage.getItem('acct_type');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Determine back link based on account type
  let backLink = '/';
  if (acctType === 'Administrator' || acctType === 'Admin') backLink = '/dashboard/admin';
  else if (acctType === 'Researcher') backLink = '/dashboard/researcher';
  else if (acctType === 'Viewer' || acctType === 'Subscriber') backLink = '/dashboard/viewer';
  else if (acctType === 'Guest') backLink = '/dashboard/guest';

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      alert("Please fill in both fields.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    if (!userId || !token) {
      alert("You must be fully logged in to change your password.");
      return;
    }

    setLoading(true);
    try {
      const payload = { pw_hash: password };
      const res = await fetch(`http://localhost:8000/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("Password updated successfully! Please log back in.");
        localStorage.clear();
        navigate('/');
      } else {
        alert("Failed to update password.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page home-page" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "1rem 2rem", width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
        <Link to={backLink} style={{ color: "#2D6A4F", textDecoration: "none", fontWeight: "bold" }}>← Back to Dashboard</Link>
      </div>

      <div style={{ flex: 1, padding: "2rem", maxWidth: "600px", margin: "0 auto", width: "100%" }}>
        <h1 style={{ color: "#1b4332", fontSize: "2.5rem", marginBottom: "0.5rem" }}>Profile Settings</h1>
        <p style={{ color: "#5C6E61", fontSize: "1.1rem", marginBottom: "2rem" }}>Update your account security settings.</p>

        <div style={{ 
          background: "rgba(255,255,255,0.85)", 
          backdropFilter: "blur(10px)", 
          padding: "2rem", 
          borderRadius: "16px", 
          boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
          border: "1px solid rgba(255,255,255,0.7)"
        }}>
          <div style={{ marginBottom: "2rem", paddingBottom: "1rem", borderBottom: "1px solid #EEE" }}>
            <h3 style={{ margin: "0 0 0.5rem 0", color: "#1b4332" }}>Account Details</h3>
            <p style={{ margin: 0, color: "#555" }}><strong>Username:</strong> {username || "Unknown"}</p>
            <p style={{ margin: "4px 0 0 0", color: "#555" }}><strong>Role:</strong> {acctType || "Unknown"}</p>
          </div>

          <h3 style={{ margin: "0 0 1rem 0", color: "#1b4332" }}>Change Password</h3>
          <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontWeight: "600", color: "#1b4332", fontSize: "0.9rem" }}>New Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ccc", background: "white" }} 
              />
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontWeight: "600", color: "#1b4332", fontSize: "0.9rem" }}>Confirm New Password</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                required 
                style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ccc", background: "white" }} 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              style={{ marginTop: "1rem", padding: "12px", background: "#2D6A4F", color: "white", border: "none", borderRadius: "8px", cursor: loading ? "not-allowed" : "pointer", fontWeight: "bold" }}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
