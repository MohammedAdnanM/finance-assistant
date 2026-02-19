/**
 * Login Component
 * Handles user authentication (login and registration) with distinct UI states.
 */
import React from "react";
import { UserIcon, EnvelopeIcon, LockClosedIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

export default function Login({ 
  email, setEmail, 
  pass, setPass, 
  name, setName, 
  confirmPass, setConfirmPass, 
  loginHandler, 
  isRegistering, setIsRegistering 
}) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#050505]">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-luminosity"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
        
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Abstract Grid Pattern */}
        <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md px-6 animate-in fade-in zoom-in duration-700">
        <div className="bg-gray-900/60 backdrop-blur-2xl border border-white/10 p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform transition-all duration-500 hover:scale-[1.01]">
          
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] mb-4">
              {isRegistering ? "Registration" : "Secure Portal"}
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-3">
              {isRegistering ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-gray-400 text-sm font-medium">
              {isRegistering 
                ? "Experience the future of personal finance" 
                : "Your financial dashboard is ready"}
            </p>
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              loginHandler();
            }} 
            className="space-y-4"
          >
            {/* Name Field (Register Only) */}
            {isRegistering && (
              <div className="group">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    className="w-full pl-11 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-white placeholder-gray-600"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="group">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="email"
                  className="w-full pl-11 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-white placeholder-gray-600"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="group">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Password</label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="password"
                  className="w-full pl-11 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-white placeholder-gray-600"
                  placeholder="••••••••"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                />
              </div>
            </div>

            {/* Confirm Password Field (Register Only) */}
            {isRegistering && (
              <div className="group">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Confirm Password</label>
                <div className="relative">
                  <ShieldCheckIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="password"
                    className="w-full pl-11 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-white placeholder-gray-600"
                    placeholder="••••••••"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              type="submit"
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-[0.98] mt-4 flex items-center justify-center space-x-2 ${
                isRegistering 
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-indigo-500/25" 
                  : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-blue-500/25"
              } hover:brightness-110 shadow-black/20`}
            >
              <span>{isRegistering ? "Create Free Account" : "Sign In to Dashboard"}</span>
            </button>
            
            {/* Toggle Link */}
            <div className="pt-4 text-center">
              <button 
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                {isRegistering 
                  ? <span>Already a member? <span className="text-indigo-400">Login here</span></span> 
                  : <span>Don't have an account? <span className="text-blue-400">Register now</span></span>
                }
              </button>
            </div>
          </form>
        </div>
        
        {/* Footer info */}
        <p className="text-center text-gray-600 text-[10px] mt-8 uppercase tracking-[0.2em]">
          Securely encrypted by Finance Assistant &copy; 2026
        </p>
      </div>
    </div>
  );
}
