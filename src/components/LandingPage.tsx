import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, MapPin, Calendar, Users, Globe, Smartphone, Share2, ChevronRight } from "lucide-react";

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 py-5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left font-bold text-slate-800 text-base md:text-lg focus:outline-none transition-colors hover:text-indigo-600"
      >
        <span>{question}</span>
        <span className={`ml-4 text-indigo-600 text-2xl transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}>
          +
        </span>
      </button>
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-60 mt-3 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <p className="text-slate-500 text-sm md:text-base leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};

export const LandingPage = () => {
  const faqs = [
    {
      question: "What is Trio and how does it work?",
      answer: "Trio is an AI-powered travel planning platform that creates personalized day-by-day itineraries. Simply enter your destination and travel dates, and our AI generates a complete trip plan with activities, accommodations, and recommendations. You can also customize every detail manually."
    },
    {
      question: "Is Trio free to use?",
      answer: "Yes, Trio offers a free plan that includes basic itinerary creation and limited AI generations. Premium subscribers unlock unlimited AI-generated itineraries, advanced collaboration features, and the ability to invite unlimited travel companions."
    },
    {
      question: "How does the AI itinerary generation work?",
      answer: "Our AI analyzes your destination, travel dates, and preferences (such as budget and interests) to create optimized daily schedules. It considers popular attractions, local dining, logical routing between locations, and typical visit durations to build realistic, enjoyable itineraries."
    },
    {
      question: "Can I invite others to collaborate on my itinerary?",
      answer: "Yes! Trio's collaboration feature lets you invite travel companions via email. They can view your shared itinerary and stay updated on trip details. Premium users can invite unlimited companions to their trips."
    },
    {
      question: "Can I access my itinerary on my phone while traveling?",
      answer: "Absolutely. Trio is fully mobile-responsive, so you can access your itineraries from any device with a web browser. No app download required—just log in and view your trip plans anywhere."
    },
    {
      question: "How do I share my itinerary with others?",
      answer: "You can share itineraries in multiple ways: generate a shareable link for anyone to view, export to PDF for offline access, or invite specific companions via email for collaborative access."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans overflow-x-hidden text-slate-800">
      {/* Decorative background blurs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[45%] h-[45%] bg-indigo-200/40 blur-[130px] rounded-full" />
        <div className="absolute top-[30%] right-[-10%] w-[40%] h-[40%] bg-blue-200/30 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <header className="px-6 md:px-12 py-6 flex justify-between items-center z-10 w-full max-w-[1200px] mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
            <span className="font-extrabold text-white text-sm tracking-tighter">tr</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800">Trio</span>
          <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-100">FREE</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="px-4 py-2 text-sm text-slate-600 hover:text-indigo-600 font-semibold transition-colors">Log in</Link>
          <Link to="/register" className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold shadow-md shadow-indigo-100 transition-all hover:-translate-y-0.5 active:translate-y-0">Sign Up</Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-16 pb-20 z-10 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6">
          <Sparkles className="w-3.5 h-3.5" /> Plan trips with AI
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] max-w-3xl">
          Trio creates personalized travel plans <span className="text-indigo-600">in seconds.</span>
        </h1>
        
        <p className="mt-6 text-lg md:text-xl text-slate-500 max-w-2xl leading-relaxed">
          Enter your destination, set your dates, and let AI build your perfect day-by-day itinerary. Start planning your next adventure today.
        </p>
        
        <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center w-full sm:w-auto">
          <Link to="/register" className="w-full sm:w-auto inline-flex items-center justify-center h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5 active:translate-y-0">
            Create Free Itinerary
          </Link>
          <a href="#how-it-works" className="w-full sm:w-auto inline-flex items-center justify-center h-14 px-8 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-full font-bold transition-all">
            See How It Works
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-white border-t border-slate-200/80 py-24 z-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 md:text-4xl">Everything you need to plan unforgettable trips</h2>
            <p className="mt-4 text-slate-500">Robust, intuitive features designed to make travel planning collaborative and simple.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Sparkles, title: "AI-Powered Generation", desc: "Enter your destination and dates, and our AI creates a complete day-by-day travel plan tailored to your preferences." },
              { icon: Calendar, title: "Day-by-Day Organization", desc: "Organize your trip with detailed daily schedules. Add activities, edit plans, and see your entire journey mapped out clearly." },
              { icon: Users, title: "Travel Companion Collaboration", desc: "Invite friends and family to view and collaborate on your itinerary. Everyone stays updated with shared access." },
              { icon: Globe, title: "Smart Location Search", desc: "Find any destination with intelligent autocomplete search. Get accurate place options in seconds." },
              { icon: Smartphone, title: "Access Anywhere", desc: "Your itineraries sync across all devices. Plan on desktop, access on mobile while traveling. No app download required." },
              { icon: Share2, title: "Easy Sharing & Export", desc: "Share your itinerary with a simple link, export to PDF for offline access, or invite companions via email." }
            ].map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div key={i} className="p-8 rounded-2xl bg-slate-50 border border-slate-200/60 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-50/50 transition-all duration-300 flex flex-col items-start text-left">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{feat.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 bg-slate-50 border-t border-slate-200/80 scroll-mt-6 z-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 md:text-4xl">From destination to detailed trip plan in minutes</h2>
            <p className="mt-4 text-slate-500">Creating your itinerary takes just a few clicks. Here's how it's done.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { num: "01", title: "Enter Destination", desc: "Type your travel destination. Our smart search finds cities, regions, and specific locations worldwide." },
              { num: "02", title: "Set Travel Dates", desc: "Select when you're traveling. The AI optimizes your itinerary based on trip length and local events." },
              { num: "03", title: "Generate with AI", desc: "Click generate and watch AI create your personalized day-by-day itinerary with activities and suggestions." },
              { num: "04", title: "Customize & Share", desc: "Edit activities, add companions, export to PDF, and share your itinerary. Your perfect trip is ready to go." }
            ].map((step, i) => (
              <div key={i} className="flex flex-col text-left relative bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                <span className="text-4xl font-black text-indigo-600/10 mb-4">{step.num}</span>
                <h3 className="text-base font-bold text-slate-800 mb-2">{step.title}</h3>
                <p className="text-slate-500 text-xs md:text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="bg-white border-t border-slate-200/80 py-24 z-10">
        <div className="max-w-[800px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 md:text-4xl">Quick answers to common questions</h2>
            <p className="mt-4 text-slate-500">Have questions about Trio? Find answers to the most frequently asked queries below.</p>
          </div>

          <div className="border-t border-slate-200 mt-8">
            {faqs.map((faq, i) => (
              <FAQItem key={i} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-indigo-900 py-20 text-white text-center relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-800 to-indigo-950 opacity-90" />
        <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Join thousands of travelers creating amazing itineraries with AI</h2>
          <p className="mt-6 text-indigo-200 text-lg max-w-xl leading-relaxed">Start planning your dream trip today. Totally free to get started.</p>
          <Link to="/register" className="mt-10 inline-flex items-center justify-center h-14 px-8 bg-white text-indigo-600 hover:bg-slate-50 rounded-full font-bold shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0">
            Start Planning Free <ChevronRight className="w-5 h-5 ml-1" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12 text-slate-400 text-sm z-10">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
              <span className="font-extrabold text-white text-xs tracking-tighter">tr</span>
            </div>
            <span className="font-bold text-slate-200 text-base">Trio</span>
          </div>
          <div className="flex flex-wrap gap-8 text-xs font-semibold uppercase tracking-wider">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <Link to="/login" className="hover:text-white transition-colors">Login</Link>
            <Link to="/register" className="hover:text-white transition-colors">Sign Up</Link>
            <a href="mailto:support@trio.ai" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-slate-500 text-xs">© 2026 Trio - Travel Itinerary Planner. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
