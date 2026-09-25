import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const API_BASE = "https://todo-app-soyi.onrender.com/api";
// const API_BASE = "http://localhost:5000/api";

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  marginBottom: 12,
  border: "1px solid #ccc",
  borderRadius: 8,
  fontSize: 15,
  boxSizing: "border-box",
};

const buttonStyle = {
  width: "100%",
  padding: "10px 12px",
  background: "#111",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontSize: 15,
  cursor: "pointer",
};

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup fail ho gaya");
      login(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f0",
        fontFamily: "sans-serif",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: 340,
          background: "#fff",
          padding: 28,
          borderRadius: 12,
          border: "1px solid #e0e0e0",
        }}
      >
        <h1 style={{ margin: "0 0 20px", fontSize: 26 }}>Signup</h1>

        {error && (
          <p style={{ color: "red", fontSize: 13, marginBottom: 12 }}>{error}</p>
        )}

        <input
          style={inputStyle}
          type="text"
          placeholder="Naam"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          style={inputStyle}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          style={inputStyle}
          type="password"
          placeholder="Password (kam se kam 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button style={buttonStyle} type="submit" disabled={loading}>
          {loading ? "Signup ho raha hai..." : "Signup"}
        </button>

        <p style={{ marginTop: 16, fontSize: 14, textAlign: "center" }}>
          Account hai? <Link to="/login">Login karein</Link>
        </p>
      </form>
    </div>
  );
}