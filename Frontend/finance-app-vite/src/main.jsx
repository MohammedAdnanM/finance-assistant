import React from "react";
import ReactDOM from "react-dom/client";
import App from './App.jsx'
import { Toaster } from "react-hot-toast";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Toaster 
      position="bottom-right" 
      toastOptions={{
        className: 'glass !bg-obsidian !text-white border border-white/10 !rounded-2xl',
        style: {
          background: '#161b22',
          color: '#fff',
          borderRadius: '1rem',
          border: '1px solid rgba(255,255,255,0.1)'
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
        },
      }}
    />
    <App />
  </React.StrictMode>
);
