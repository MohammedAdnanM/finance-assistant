import { error } from "./toast";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000";

// API FOR EXPO GO
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const fetchUserData = async () => {
  const response = await fetch(`${API_URL}/api/user`);
  return response.json();
};

async function request(endpoint, method = "GET", body = null) {
    const token = localStorage.getItem("token");
    const headers = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : null,
        });

        if (res.status === 401) {
            error("Session expired. Please login again.");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            // Optional: Redirect or reload to force logout
            setTimeout(() => window.location.reload(), 1500);
            return null;
        }

        return res;
    } catch (e) {
        console.error("API Error:", e);
        error("Network error");
        return null;
    }
}

export const api = {
    get: (endpoint) => request(endpoint, "GET"),
    post: (endpoint, body) => request(endpoint, "POST", body),
    put: (endpoint, body) => request(endpoint, "PUT", body),
    delete: (endpoint) => request(endpoint, "DELETE"),
};
