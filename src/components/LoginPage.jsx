import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const styles = {
  bg: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f7f8fa",
  },
  container: {
    background: "#fff",
    padding: "2rem 2.5rem",
    borderRadius: "12px",
    boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
    width: "100%",
    maxWidth: "400px",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: "0.5rem",
  },
  desc: {
    textAlign: "center",
    color: "#666",
    marginBottom: "1.5rem",
  },
  label: {
    fontWeight: "600",
    marginBottom: "0.25rem",
    display: "block",
  },
  input: {
    width: "100%",
    padding: "0.5rem",
    border: "1px solid #ddd",
    borderRadius: "6px",
    marginBottom: "1rem",
    fontSize: "1rem",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.25rem",
  },
  link: {
    color: "#3bb77e",
    fontSize: "0.95rem",
    textDecoration: "none",
  },
  btn: {
    width: "100%",
    background: "#3bb77e",
    color: "#fff",
    padding: "0.7rem",
    border: "none",
    borderRadius: "6px",
    fontWeight: "bold",
    fontSize: "1rem",
    cursor: "pointer",
    marginBottom: "1rem",
  },
  footer: {
    textAlign: "center",
    marginBottom: "1rem",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    margin: "1.5rem 0 1rem 0",
    color: "#aaa",
    fontSize: "0.9rem",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "#eee",
  },
  dividerText: {
    margin: "0 0.7rem",
  },
  socials: {
    display: "flex",
    gap: "1rem",
  },
  socialBtn: {
    flex: 1,
    border: "1px solid #ddd",
    borderRadius: "6px",
    padding: "0.6rem",
    background: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        navigate("/"); // Redirect to homepage after successful login
      } else {
        setError(data.message || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      setError("An error occurred. Please try again later.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.bg}>
      <div style={styles.container}>
        <h2 style={styles.title}>Welcome back</h2>
        <p style={styles.desc}>
          Login to your account to place orders and view your order history
        </p>
        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            placeholder="your.email@example.com"
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div style={styles.row}>
            <label style={styles.label}>Password</label>
            <a href="#" style={styles.link}>
              Forgot password?
            </a>
          </div>
          <input
            type="password"
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && (
            <div style={{ color: "red", marginBottom: "1rem", fontSize: "0.9rem" }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            style={{
              ...styles.btn,
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div style={styles.footer}>
          <span>Don't have an account? </span>
          <a href="/register" style={styles.link}>
            Register
          </a>
        </div>
        <div style={styles.divider}>
          <div style={styles.dividerLine}></div>
          <span style={styles.dividerText}>OR CONTINUE WITH</span>
          <div style={styles.dividerLine}></div>
        </div>
        <div style={styles.socials}>
          <button style={styles.socialBtn}>Google</button>
          <button style={styles.socialBtn}>Facebook</button>
        </div>
      </div>
    </div>
  );
} 