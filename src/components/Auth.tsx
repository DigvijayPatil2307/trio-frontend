import React, { useState } from "react";
import { useAuth } from "../lib/AuthContext";
import api from "../lib/api";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#F3F4F6] relative px-4 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-200/50 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-200/50 blur-[100px] rounded-full"></div>
      </div>
      
      <div className="absolute top-8 left-8 flex items-center gap-2">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
          <span className="font-extrabold text-white text-sm tracking-tighter">tr</span>
        </div>
        <Link to="/" className="font-bold text-xl tracking-tight text-slate-800">Trio</Link>
      </div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
          <p className="text-slate-500">Login to your account to view your itineraries.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {error && <div className="text-red-500 text-sm font-medium p-3 bg-red-50 rounded-lg">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 border-slate-200 focus-visible:ring-indigo-600 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 border-slate-200 focus-visible:ring-indigo-600 rounded-xl"
              />
            </div>
          </div>
          <div className="flex flex-col space-y-4 pt-2">
            <Button type="submit" className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm text-base font-bold transition-all">Login</Button>
            <div className="text-sm text-center text-slate-500 font-medium">
              Don't have an account? <Link to="/register" className="text-indigo-600 hover:text-indigo-800 transition-colors">Register here</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasUppercase || !hasLowercase || !hasNumber) {
      setError("Password must contain at least one uppercase letter, one lowercase letter, and one number.");
      return;
    }

    try {
      const res = await api.post("/auth/register", { name, email, password });
      login(res.data);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#F3F4F6] relative px-4 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-200/50 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-amber-200/50 blur-[100px] rounded-full"></div>
      </div>
      
      <div className="absolute top-8 left-8 flex items-center gap-2">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
          <span className="font-extrabold text-white text-sm tracking-tighter">tr</span>
        </div>
        <Link to="/" className="font-bold text-xl tracking-tight text-slate-800">Trio</Link>
      </div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Create an Account</h2>
          <p className="text-slate-500">Get started building your smart itinerary.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {error && <div className="text-red-500 text-sm font-medium p-3 bg-red-50 rounded-lg">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Name</Label>
              <Input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 border-slate-200 focus-visible:ring-indigo-600 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 border-slate-200 focus-visible:ring-indigo-600 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 border-slate-200 focus-visible:ring-indigo-600 rounded-xl"
              />
              <p className="text-[11px] text-slate-400 leading-normal">
                Must be at least 6 characters and contain an uppercase letter, lowercase letter, and a number.
              </p>
            </div>
          </div>
          <div className="flex flex-col space-y-4 pt-2">
            <Button type="submit" className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm text-base font-bold transition-all">Sign Up</Button>
            <div className="text-sm text-center text-slate-500 font-medium">
              Already have an account? <Link to="/login" className="text-indigo-600 hover:text-indigo-800 transition-colors">Log in</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
