import { Form, Formik } from "formik";
import TextInput from "../components/form/TextInput";
import { useNavigate } from "react-router-dom";
import "./common.css";

interface LoginForm {
  username: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = async (values: LoginForm) => {
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

      // Decode JWT to get the account type
      let role = "Guest";
      try {
        const payloadStr = atob(data.access_token.split('.')[1]);
        const payload = JSON.parse(payloadStr);
        if (payload.acct_type) {
          role = payload.acct_type;
        }
      } catch (e) {
        console.error("Failed to parse JWT", e);
      }
      
      localStorage.setItem("acct_type", role);

      // Route to correct dashboard
      let path = "guest";
      if (role === "Administrator" || role === "Admin") path = "admin";
      else if (role === "Researcher") path = "researcher";
      else if (role === "Viewer") path = "viewer";

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
            <h2>Welcome Back</h2>
            <p className="login-subtitle">Sign in to access the system</p>

            <Formik
              initialValues={{ username: "", password: "" }}
              onSubmit={handleLogin}
            >
              <Form>
                <div className="form-group">
                  <TextInput label="Username" name="username" />
                </div>

                <div className="form-group">
                  <TextInput label="Password" name="password" type="password" />
                </div>

                <button type="submit" className="login-button">
                  Sign In
                </button>
              </Form>
            </Formik>

            <div className="login-help">
              Don't have an account? Contact your administrator.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}