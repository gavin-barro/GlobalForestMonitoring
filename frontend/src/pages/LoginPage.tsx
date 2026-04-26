import { Form, Formik } from "formik";
import TextInput from "../components/form/TextInput";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { format } from "date-fns";
import "./common.css";

interface AuthForm {
  username: string;
  password: string;
  email?: string;
}

export default function Login() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);

  const handleGuestLogin = () => {
    localStorage.clear();
    localStorage.setItem("acct_type", "Guest");
    localStorage.setItem("username", "Guest User");
    navigate('/dashboard/guest');
  };

  const handleAuth = async (values: AuthForm) => {
    // DEV QUICK LOGIN BYPASS
    const lowerUser = values.username.toLowerCase();
    if (["admin", "researcher", "viewer", "guest"].includes(lowerUser)) {
        localStorage.setItem("token", "dummy");
        localStorage.setItem("username", values.username);
        
        let role = "Guest";
        if (lowerUser === "admin") role = "Administrator";
        if (lowerUser === "researcher") role = "Researcher";
        if (lowerUser === "viewer") role = "Viewer";
        
        localStorage.setItem("acct_type", role);
        navigate(`/dashboard/${lowerUser}`);
        return;
    }

    try {
      if (isSignUp) {
         if (!values.email) {
            alert("Email is required to sign up.");
            return;
         }
         const today = format(new Date(), "yyyy-MM-dd");
         const signupPayload = {
             username: values.username,
             email: values.email,
             acct_type: "Subscriber", // Default for new signups
             pw_hash: values.password,
             creation_date: today
         };
         const signupRes = await fetch("http://localhost:8000/users/", {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify(signupPayload)
         });
         
         if (!signupRes.ok) {
             const errorData = await signupRes.json();
             alert(errorData.detail || "Error creating account. Username/Email may already be taken.");
             return;
         }
      }

      const params = new URLSearchParams({
        username: values.username,
        password: values.password,
      });

      const response = await fetch(`http://localhost:8000/users/login?${params.toString()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        alert("Invalid username or password");
        return;
      }

      const data = await response.json();
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("username", values.username);

      // Decode JWT to get the account type and user ID
      let role = "Guest";
      try {
        const payloadStr = atob(data.access_token.split('.')[1]);
        const payload = JSON.parse(payloadStr);
        if (payload.acct_type) {
          role = payload.acct_type;
        }
        if (payload.sub) {
          localStorage.setItem("user_id", payload.sub);
        }
      } catch (e) {
        console.error("Failed to parse JWT", e);
      }
      
      localStorage.setItem("acct_type", role);

      // Route to correct dashboard
      let path = "guest";
      if (role === "Administrator" || role === "Admin") path = "admin";
      else if (role === "Researcher") path = "researcher";
      else if (role === "Viewer" || role === "Subscriber") path = "viewer";

      navigate(`/dashboard/${path}`);
    } catch (error) {
      alert("Login failed. Please try again.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left Side - Description */}
        <div className="login-left">
          <div className="login-brand">
            <h1>Global Forest Watch</h1>
            <p className="subtitle">Database Management System</p>
          </div>

          <div className="features-list">
            <div className="feature-item">
              <span className="feature-icon">🌳</span>
              <span>Track canopy decimation</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🛰️</span>
              <span>View live satellite feeds</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span>Analyze statistical trends</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔔</span>
              <span>Get real-time alerts</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🌍</span>
              <span>Monitor global forest health</span>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-right">
          <div className="login-card">
            <h2>{isSignUp ? "Create an Account" : "Welcome Back"}</h2>
            <p className="login-subtitle">
              {isSignUp ? "Sign up to track and save global forest assets" : "Sign in to access the system"}
            </p>

            <Formik
              initialValues={{ username: "", password: "", email: "" }}
              onSubmit={handleAuth}
            >
              <Form>
                {isSignUp && (
                  <div className="form-group">
                    <TextInput label="Email Address" name="email" type="email" />
                  </div>
                )}
                
                <div className="form-group">
                  <TextInput label="Username" name="username" />
                </div>

                <div className="form-group">
                  <TextInput label="Password" name="password" type="password" />
                </div>

                <button type="submit" className="login-button">
                  {isSignUp ? "Sign Up" : "Sign In"}
                </button>
              </Form>
            </Formik>

            <div className="login-help">
              {isSignUp ? (
                <>Already have an account? <span style={{ color: "#2D6A4F", cursor: "pointer", fontWeight: "bold" }} onClick={() => setIsSignUp(false)}>Sign in here.</span></>
              ) : (
                <>Don't have an account? <span style={{ color: "#2D6A4F", cursor: "pointer", fontWeight: "bold" }} onClick={() => setIsSignUp(true)}>Sign up here.</span></>
              )}
            </div>

            <div style={{ marginTop: "1rem", textAlign: "center" }}>
              <button 
                onClick={handleGuestLogin} 
                className="guest-button" 
                style={{ 
                  background: "transparent", 
                  border: "1px solid #ccc", 
                  color: "#555", 
                  padding: "8px 16px", 
                  borderRadius: "8px", 
                  cursor: "pointer", 
                  fontSize: "0.9rem",
                  fontWeight: "bold"
                }}
              >
                Continue as Guest →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}