import { useState } from "react";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="bg-gray-900/60 p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-700">
        <h1 className="text-3xl font-bold text-center mb-6">Finance Assistant</h1>

        <input
          className="w-full mb-4 p-3 rounded-xl bg-gray-800 border border-gray-700"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full mb-5 p-3 rounded-xl bg-gray-800 border border-gray-700"
          placeholder="Password"
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />

        <button
          onClick={() => onLogin(email, pass)}
          className="w-full p-3 bg-blue-600 rounded-xl font-semibold hover:bg-blue-700 transition"
        >
          Login
        </button>
      </div>
    </div>
  );
}
