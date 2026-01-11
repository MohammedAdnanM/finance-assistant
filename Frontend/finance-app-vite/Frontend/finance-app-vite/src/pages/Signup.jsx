import { useState } from "react";

export default function Signup({ onSignup }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="bg-gray-900/60 p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-700">
        <h1 className="text-3xl font-bold text-center mb-6">Create Account</h1>

        <input
          className="w-full mb-4 p-3 rounded-xl bg-gray-800 border border-gray-700"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full mb-4 p-3 rounded-xl bg-gray-800 border border-gray-700"
          placeholder="Password"
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />

        <input
          className="w-full mb-5 p-3 rounded-xl bg-gray-800 border border-gray-700"
          placeholder="Confirm Password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        <button
          onClick={() => onSignup(email, pass, confirm)}
          className="w-full p-3 bg-green-600 rounded-xl font-semibold hover:bg-green-700 transition"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
