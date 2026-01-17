/**
 * Login Component
 * Process: Handles user authentication (email/password entry) and validation.
 * Main Functionality:
 *  - User Authentication (Email/Pass)
 *  - Input Validation
 */
import React from "react";

export default function Login({ email, setEmail, pass, setPass, loginHandler, isRegistering, setIsRegistering }) {
  return (
    <div className="h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-gray-900 p-8 rounded-xl w-96 shadow-2xl border border-gray-800">
        <h1 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Finance Assistant
        </h1>
        <div className="space-y-4">
            <div>
                <label className="text-xs text-gray-500 uppercase font-semibold">Email</label>
                <input
                className="w-full mt-1 p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div>
                <label className="text-xs text-gray-500 uppercase font-semibold">Password</label>
                <input
                className="w-full mt-1 p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="••••••••"
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                />
            </div>
            <button
            onClick={loginHandler}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 p-3 rounded-lg font-bold mt-2 transition-all active:scale-95"
            >
            {isRegistering ? "Create Account" : "Access Dashboard"}
            </button>
            
            <button 
                onClick={() => setIsRegistering(!isRegistering)}
                className="w-full text-sm text-gray-500 hover:text-white transition-colors"
            >
                {isRegistering ? "Already have an account? Login" : "Need an account? Register"}
            </button>
        </div>
      </div>
    </div>
  );
}
