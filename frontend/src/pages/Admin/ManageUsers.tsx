import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllUsers, requestCreateUser, requestDeleteUser } from "../../services";
import type { UserGet, UserFormBackend } from "../../types";
import { format } from "date-fns";
import '../dashboards/dashboard.css';

export default function ManageUsers() {
   const navigate = useNavigate();
   const [activeTab, setActiveTab] = useState<'view' | 'add'>('view');

   const [users, setUsers] = useState<UserGet[]>([]);
   const [loading, setLoading] = useState(true);

   // Form State
   const [formUsername, setFormUsername] = useState('');
   const [formEmail, setFormEmail] = useState('');
   const [formType, setFormType] = useState<'Admin' | 'Researcher' | 'Subscriber'>('Subscriber');
   const [formPassword, setFormPassword] = useState('');
   const [isSubmitting, setIsSubmitting] = useState(false);

   useEffect(() => {
      if (localStorage.getItem('acct_type') !== 'Administrator' && localStorage.getItem('acct_type') !== 'Admin') {
         navigate('/');
         return;
      }

      getAllUsers().then(result => {
         setUsers(result);
         setLoading(false);
      });
   }, [navigate]);

   const handleDelete = async (id: number) => {
      // Prevent suicide
      if (id.toString() === localStorage.getItem('user_id')) {
         alert("You cannot delete your own account.");
         return;
      }

      if (!window.confirm("Are you sure you want to delete this user?")) return;
      const success = await requestDeleteUser(id);
      if (success) {
         setUsers((prev) => prev.filter((user) => user.user_id !== id));
      } else {
         alert("Failed to delete user.");
      }
   };

   const handleAddSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formUsername || !formEmail || !formPassword) {
         alert("All fields are required.");
         return;
      }

      setIsSubmitting(true);
      const today = format(new Date(), "yyyy-MM-dd");
      const newUser: UserFormBackend = {
         username: formUsername,
         email: formEmail,
         acct_type: formType,
         pw_hash: formPassword,
         creation_date: today
      };

      const success = await requestCreateUser(newUser);
      if (success) {
         alert("User added successfully.");
         getAllUsers().then(setUsers);
         setFormUsername(''); setFormEmail(''); setFormPassword(''); setFormType('Subscriber');
         setActiveTab('view');
      } else {
         alert("Error adding user (username or email may already exist).");
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
               <h1 style={{ color: "#1b4332", fontSize: "2.5rem", margin: 0 }}>User Management</h1>
               <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                     onClick={() => setActiveTab('view')}
                     style={{ padding: "8px 16px", borderRadius: "8px", border: "none", fontWeight: "bold", cursor: "pointer", background: activeTab === 'view' ? "#2D6A4F" : "#E6E1D6", color: activeTab === 'view' ? "white" : "#1b4332" }}
                  >
                     Active Directory
                  </button>
                  <button
                     onClick={() => setActiveTab('add')}
                     style={{ padding: "8px 16px", borderRadius: "8px", border: "none", fontWeight: "bold", cursor: "pointer", background: activeTab === 'add' ? "#2D6A4F" : "#E6E1D6", color: activeTab === 'add' ? "white" : "#1b4332" }}
                  >
                     + Register User
                  </button>
               </div>
            </div>
            <p style={{ color: "#5C6E61", fontSize: "1.1rem", marginBottom: "2rem" }}>Control access roles and accounts for the GFW database.</p>

            {loading ? (
               <p>Loading users...</p>
            ) : activeTab === 'view' ? (
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                  {users.map((user) => (
                     <div key={user.user_id} style={{
                        background: "rgba(255,255,255,0.85)",
                        backdropFilter: "blur(10px)",
                        padding: "1.5rem",
                        borderRadius: "16px",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
                        border: "1px solid rgba(255,255,255,0.7)"
                     }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                           <div>
                              <h3 style={{ margin: 0, color: "#1b4332", fontSize: "1.3rem" }}>{user.username}</h3>
                              <div style={{ fontSize: "0.9rem", color: "#555" }}>{user.email}</div>
                           </div>
                           <span style={{
                              background: user.acct_type === 'Admin' || user.acct_type === 'Administrator' ? '#e8f5e9' : '#f5f5f5',
                              color: user.acct_type === 'Admin' || user.acct_type === 'Administrator' ? '#2e7d32' : '#666',
                              padding: "4px 8px", borderRadius: "8px", fontSize: "0.8rem", fontWeight: "bold"
                           }}>
                              {user.acct_type}
                           </span>
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "#888", marginBottom: "1rem" }}>
                           Joined: {user.creation_date}
                        </div>
                        <button
                           onClick={() => handleDelete(user.user_id)}
                           style={{ width: "100%", padding: "10px", background: "#ffebee", color: "#c62828", border: "1px solid #ef9a9a", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
                        >
                           Delete Account
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
                     <h3 style={{ margin: 0, color: "#1b4332", fontSize: "1.5rem" }}>Register New Account</h3>

                     <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label style={{ fontWeight: "600", color: "#1b4332" }}>Username</label>
                        <input type="text" value={formUsername} onChange={e => setFormUsername(e.target.value)} required placeholder="EX: jdoe99" style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ccc", background: "white" }} />
                     </div>

                     <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label style={{ fontWeight: "600", color: "#1b4332" }}>Email Address</label>
                        <input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} required placeholder="user@domain.com" style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ccc", background: "white" }} />
                     </div>

                     <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label style={{ fontWeight: "600", color: "#1b4332" }}>Account Role</label>
                        <select value={formType} onChange={e => setFormType(e.target.value as any)} required style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ccc", background: "white" }}>
                           <option value="Subscriber">Subscriber / Viewer</option>
                           <option value="Researcher">Researcher</option>
                           <option value="Admin">Administrator</option>
                        </select>
                     </div>

                     <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label style={{ fontWeight: "600", color: "#1b4332" }}>Temporary Password</label>
                        <input type="password" value={formPassword} onChange={e => setFormPassword(e.target.value)} required style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ccc", background: "white" }} />
                     </div>

                     <button type="submit" disabled={isSubmitting} style={{ marginTop: "1rem", padding: "14px", background: "#2D6A4F", color: "white", border: "none", borderRadius: "8px", cursor: isSubmitting ? "not-allowed" : "pointer", fontWeight: "bold", fontSize: "1.1rem" }}>
                        {isSubmitting ? "Registering..." : "Create User"}
                     </button>
                  </form>
               </div>
            )}
         </div>
      </div>
   );
}
