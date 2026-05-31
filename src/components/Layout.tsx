import React, { useState } from "react";
import { useAuth } from "../lib/AuthContext";
import { Navigate, Outlet, Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

export const Layout = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  if (loading) return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-slate-900 flex flex-col font-sans">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0 sticky top-0 z-[2000] w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
            <span className="font-extrabold text-white text-sm tracking-tighter">tr</span>
          </div>
          <Link to="/dashboard" className="font-bold text-xl tracking-tight text-slate-800">
            Trio
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-500">
            <Link to="/dashboard" className="text-indigo-600">Dashboard</Link>
            <Link to="/dashboard" className="hover:text-slate-800">Trips</Link>
          </div>
          <button onClick={() => navigate("/create")} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 sm:px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors border-none outline-none cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            <span className="hidden sm:inline">Plan New Trip</span>
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)} 
              className="flex items-center gap-2 cursor-pointer border-none outline-none bg-transparent p-0"
              title="Profile Options"
            >
              <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                <div className="bg-indigo-400 hover:bg-indigo-500 transition-colors w-full h-full flex items-center justify-center text-white text-xs font-bold">
                  {user.name.substring(0,2).toUpperCase()}
                </div>
              </div>
            </button>
            
            {showProfileMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowProfileMenu(false)}
                />
                
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-lg z-20 py-2.5 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 text-left">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider animate-pulse">Signed in as</p>
                    <p className="text-sm font-bold text-slate-800 truncate mt-0.5">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                  </div>
                  <div className="h-px bg-slate-100 my-2" />
                  <button 
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-bold flex items-center gap-2 transition-colors border-none outline-none bg-transparent cursor-pointer"
                  >
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    <span>Log Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 w-full max-w-[1024px] mx-auto p-6 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};
