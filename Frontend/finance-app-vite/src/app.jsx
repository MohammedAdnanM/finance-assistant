import React, { useState } from "react";
import { error, success } from "./utils/toast";

// Pages
// Pages
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(
    () => !!localStorage.getItem("token")
  );
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  /* ---------------- AUTH ---------------- */
  const [isRegistering, setIsRegistering] = useState(false);
  const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000";

  React.useEffect(() => {
    async function verify() {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const res = await fetch(`${API_BASE}/api/user`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (!res.ok) {
                    logoutHandler();
                }
            } catch (e) {
                // Keep logged in if network fails
                console.error("Token verification failed:", e);
            }
        }
    }
    verify();
}, []);

  /* ---------------- AUTH ---------------- */
  async function loginHandler() {
    const trimmedEmail = email.trim();
    const trimmedPass = pass.trim();
    
    if (!trimmedEmail || !trimmedPass) {
        error("Please fill in all fields");
        return;
    }
    
    // Email format check
    if (!trimmedEmail.includes("@")) {
        error("Please enter a valid email");
        return;
    }
    try {
        const endpoint = isRegistering ? "/register" : "/login";
        const res = await fetch(`${API_BASE}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password: pass })
        });
        
        const data = await res.json();
        if (res.ok) {
            if (isRegistering) {
                success("Account created! Logging in...");
                // Save token and log in immediately
                localStorage.setItem("token", data.access_token);
                localStorage.setItem("user", "true");
                setEmail("");
                setPass("");
                setIsRegistering(false);
                setLoggedIn(true);
            } else {
                localStorage.setItem("token", data.access_token);
                localStorage.setItem("user", "true");
                setEmail("");
                setPass("");
                setLoggedIn(true);
                success("Welcome back!");
            }
        } else {
            error(data.msg || "Authentication failed");
        }
    } catch (e) {
        console.error(e);
        error("Connection error. Is backend running?");
    }
}

  function logoutHandler() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setLoggedIn(false);
  }

  /* ---------------- RENDER ---------------- */
  if (!loggedIn) {
    return (
      <Login
        email={email}
        setEmail={setEmail}
        pass={pass}
        setPass={setPass}
        loginHandler={loginHandler}
        isRegistering={isRegistering}
        setIsRegistering={setIsRegistering}
      />
    );
  }

  return (
    <Dashboard logoutHandler={logoutHandler} />
  );
}
