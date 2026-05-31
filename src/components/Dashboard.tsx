import React, { useEffect, useState, useCallback } from "react";
import api from "../lib/api";
import { Trip } from "../types";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuth } from "../lib/AuthContext";
import { useWikipediaImage } from "../hooks/useWikipediaImage";
import { Calendar, Wallet, Search, SlidersHorizontal, AlertCircle } from "lucide-react";
import { useToast } from "../lib/ToastContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";

const formatDateRange = (startDateStr: string | Date, daysCount: number) => {
  if (!startDateStr) return `${daysCount} Days`;
  const start = new Date(startDateStr);
  const end = new Date(start);
  end.setDate(start.getDate() + (daysCount - 1));
  
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  
  if (start.getFullYear() === end.getFullYear()) {
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', options);
    return `${startStr} — ${endStr}`;
  }
  
  return `${start.toLocaleDateString('en-US', options)} — ${end.toLocaleDateString('en-US', options)}`;
};

const getTripStatus = (startDateStr: string | Date, daysCount: number) => {
  if (!startDateStr) return "upcoming";
  
  const start = new Date(startDateStr);
  start.setHours(0,0,0,0);
  
  const end = new Date(start);
  end.setDate(start.getDate() + daysCount);
  end.setHours(23,59,59,999);
  
  const now = new Date();
  
  if (now < start) {
    return "upcoming";
  } else if (now > end) {
    return "completed";
  } else {
    return "active";
  }
};

const TripCard: React.FC<{ trip: Trip; onDelete: (id: string) => void }> = ({ trip, onDelete }) => {
  const { imageUrl } = useWikipediaImage(trip.destination);
  const status = getTripStatus(trip.startDate, trip.numberOfDays);
  
  const badgeColors = {
    upcoming: "bg-indigo-600/90 text-white border-indigo-400",
    active: "bg-emerald-600/90 text-white border-emerald-400 flex items-center gap-1.5",
    completed: "bg-slate-500/90 text-white border-slate-400"
  };

  const badgeText = {
    upcoming: "Upcoming",
    active: "Active Now",
    completed: "Completed"
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-indigo-300 transition-colors group">
      <div className="h-32 bg-slate-900 relative overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={trip.destination} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700 mix-blend-overlay" referrerPolicy="no-referrer" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-60"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <div className="absolute bottom-3 left-4 text-white z-10">
          <span className={`backdrop-blur-md text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider mb-1.5 inline-flex items-center ${badgeColors[status]}`}>
            {status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-white inline-block animate-pulse" />}
            {badgeText[status]}
          </span>
          <h2 className="text-lg font-bold line-clamp-1 drop-shadow-md">{trip.destination}</h2>
        </div>
      </div>
      <div className="flex-1 p-5 flex flex-col gap-4">
        <div className="flex gap-4 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>{formatDateRange(trip.startDate, trip.numberOfDays)} ({trip.numberOfDays} Days)</span>
          </div>
          <div className="flex items-center gap-1">
            <Wallet className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> {trip.budgetType}
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {trip.interests.slice(0, 3).map((interest, i) => (
            <span key={i} className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-1 rounded">{interest}</span>
          ))}
          {trip.interests.length > 3 && <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-1 rounded">+{trip.interests.length - 3}</span>}
        </div>
        <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
          <Link to={`/trip/${trip._id}`} className="inline-flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 rounded-lg w-full text-xs h-8 font-medium transition-colors">
            View
          </Link>
          <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 w-full text-xs h-8 font-bold cursor-pointer" onClick={(e) => { e.preventDefault(); onDelete(trip._id); }}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

const DashboardBudgetChart = ({ trips }: { trips: Trip[] }) => {
  const flights = trips.reduce((acc, t) => acc + (t.itinerary?.budget?.flights || 0), 0);
  const stay = trips.reduce((acc, t) => acc + (t.itinerary?.budget?.accommodation || 0), 0);
  const food = trips.reduce((acc, t) => acc + (t.itinerary?.budget?.food || 0), 0);
  const activities = trips.reduce((acc, t) => acc + (t.itinerary?.budget?.activities || 0), 0);
  const transit = trips.reduce((acc, t) => acc + (t.itinerary?.budget?.transportation || 0), 0);
  const total = flights + stay + food + activities + transit;

  if (total === 0) return null;

  const categories = [
    { name: "Flights", value: flights, color: "#6366f1" },
    { name: "Stay", value: stay, color: "#14b8a6" },
    { name: "Food", value: food, color: "#f97316" },
    { name: "Activities", value: activities, color: "#a855f7" },
    { name: "Transit", value: transit, color: "#3b82f6" }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Budget Allocation</h3>
      <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
        {categories.map((cat, i) => {
          const pct = (cat.value / total) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={i}
              className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-500 hover:opacity-90 relative group cursor-help"
              style={{ width: `${pct}%`, backgroundColor: cat.color }}
              title={`${cat.name}: $${cat.value.toLocaleString()} (${pct.toFixed(1)}%)`}
            />
          );
        })}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-1">
        {categories.map((cat, i) => {
          const pct = total > 0 ? (cat.value / total) * 100 : 0;
          return (
            <div key={i} className="flex flex-col bg-slate-50 border border-slate-100 p-2 rounded-xl text-center">
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{cat.name}</span>
              </div>
              <span className="text-sm font-bold text-slate-800">${cat.value.toLocaleString()}</span>
              <span className="text-[10px] font-semibold text-slate-400">{pct.toFixed(1)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const Dashboard = () => {
  const toast = useToast();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [budgetFilter, setBudgetFilter] = useState<string>("All");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const fetchTrips = useCallback(async () => {
    try {
      const res = await api.get("/trips");
      setTrips(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const handleDeleteClick = (id: string) => {
    setPendingDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteTrip = async () => {
    if (!pendingDeleteId) return;
    try {
      await api.delete(`/trips/${pendingDeleteId}`);
      setTrips((prev) => prev.filter(t => t._id !== pendingDeleteId));
      toast.success("Trip itinerary deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete trip.");
    } finally {
      setShowDeleteConfirm(false);
      setPendingDeleteId(null);
    }
  };

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch = trip.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          trip.interests.some(interest => interest.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesBudget = budgetFilter === "All" || trip.budgetType === budgetFilter;
    return matchesSearch && matchesBudget;
  });

  if (authLoading || loading) return <div className="p-6">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      {/* Header Profile card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white rounded-2xl border border-slate-200 p-6 shadow-sm gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Welcome back, {user?.name ? user.name.split(' ')[0] : "Guest"}</h1>
          <p className="text-slate-500">
            {trips.length > 0 ? `You have ${trips.length} active itineraries planned.` : "Ready to plan your next adventure?"}
          </p>
        </div>
        <div className="flex flex-wrap gap-6 md:gap-8">
          <div className="text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Trips</p>
            <p className="text-2xl font-bold text-indigo-600">{trips.length}</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Budget Tracked</p>
            <p className="text-2xl font-bold text-slate-800">
              ${trips.reduce((acc, t) => acc + (t.itinerary?.budget?.total || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* SVG Budget Chart */}
      {trips.length > 0 && <DashboardBudgetChart trips={trips} />}

      {/* Search and Filters panel */}
      {trips.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by destination or interest..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
            <div className="flex items-center gap-1 text-slate-400 mr-2 text-xs font-bold uppercase tracking-wider shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Budget:</span>
            </div>
            {["All", "Low", "Medium", "High"].map((b) => (
              <button
                key={b}
                onClick={() => setBudgetFilter(b)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all border shrink-0 cursor-pointer ${
                  budgetFilter === b
                    ? "bg-indigo-600 border-transparent text-white shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                {b === "All" ? "All Budgets" : b}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Trips list grid */}
      <div className="space-y-4">
        {trips.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
            <p className="text-slate-500 mb-4">You haven't created any trips yet.</p>
            <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-full" onClick={() => navigate("/create")}>Start Planning</Button>
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
            <p className="text-slate-500">No trips matching your search filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTrips.map(trip => (
              <TripCard key={trip._id} trip={trip} onDelete={handleDeleteClick} />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={(open) => !open && setShowDeleteConfirm(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" /> Delete Trip Itinerary?
            </DialogTitle>
            <DialogDescription className="text-slate-500 pt-2 leading-relaxed">
              Are you sure you want to permanently delete this trip itinerary? This action cannot be undone and will remove all custom activities, expenses, and companion associations.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeleteConfirm(false);
                setPendingDeleteId(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white font-bold" 
              onClick={confirmDeleteTrip}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};
