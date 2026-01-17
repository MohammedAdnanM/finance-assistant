import React, { useState } from "react";
import { error, success } from "./utils/toast";

// Pages
// Pages
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(
    () => localStorage.getItem("user") === "true"
  );
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  /* ---------------- AUTH ---------------- */
  const [isRegistering, setIsRegistering] = useState(false);
  const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000";

  /* ---------------- AUTH ---------------- */
  async function loginHandler() {
    if (!email || !pass) {
        error("Please fill in all fields");
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
                setIsRegistering(false); 
                // Auto login after register? Or just switch to login mode? 
                // Let's just switch to login mode for simplicity or call login immediately.
                // For better UX, let's just ask them to login now.
            } else {
                localStorage.setItem("token", data.access_token);
                localStorage.setItem("user", "true");
                setLoggedIn(true);
                success("Welcome back!");
            }
        } else {
            error(data.msg || "Authentication failed");
        }
    } catch (e) {
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
