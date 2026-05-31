import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { Trip, DayPlan } from "../types";
import { Button } from "./ui/button";
import { Plane, Calendar as CalendarIcon, Hotel, Map, HandCoins, AlertCircle, RefreshCw, Plus, X, Image as ImageIcon, Share2, UserPlus, Printer, DollarSign, Trash2, Compass, Camera } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { useWikipediaImage } from "../hooks/useWikipediaImage";
import { useToast } from "../lib/ToastContext";

const extractPlaceName = (desc: string) => {
  let place = desc;
  
  // Strip leading phrases
  place = place.replace(/^(morning|afternoon|evening|night|early morning|late night)\s+/i, '');
  place = place.replace(/^(exploration|visit|tour|trip|journey|dinner|lunch|breakfast|sightseeing|relaxation|shopping|walk)\s+(of|at|to|in)\s+/i, '');
  place = place.replace(/^(visit|explore|enjoy|see|tour|walk around|relax at|stay at|check into|dine at|eat at|shop at|go to)\s+/i, '');
  
  // If it contains " at " (e.g. "Lunch at Hawa Mahal"), pick what follows " at "
  if (place.toLowerCase().includes(" at ")) {
    const parts = place.split(/\s+at\s+/i);
    if (parts[1]) place = parts[1];
  }
  // If it contains " of " (e.g. "exploration of Amber Fort"), pick what follows " of "
  else if (place.toLowerCase().includes(" of ")) {
    const parts = place.split(/\s+of\s+/i);
    if (parts[1]) place = parts[1];
  }
  // If it contains " to " (e.g. "travel to Eiffel Tower"), pick what follows " to "
  else if (place.toLowerCase().includes(" to ")) {
    const parts = place.split(/\s+to\s+/i);
    if (parts[1]) place = parts[1];
  }
  // If it contains " in " (e.g. "Sightseeing in Central Park"), pick what follows " in "
  else if (place.toLowerCase().includes(" in ")) {
    const parts = place.split(/\s+in\s+/i);
    if (parts[1]) place = parts[1];
  }

  // Strip trailing descriptions like "and shopping", "for lunch", "and its grand courtyards"
  place = place.split(/\s+(and|for|with|to\s+explore|to\s+see|to\s+dine)\s+/i)[0];
  
  // Clean up any remaining leading/trailing articles
  place = place.replace(/^(the|a|an)\s+/i, '').trim();
  
  // Strip trailing punctuation
  place = place.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
  
  return place || desc;
};

const getFallbackImageByCategory = (text: string) => {
  const t = text.toLowerCase();
  if (t.includes("hotel") || t.includes("stay") || t.includes("resort") || t.includes("villa") || t.includes("check into") || t.includes("accommodation") || t.includes("pearl") || t.includes("lemon tree") || t.includes("sayaji")) {
    return "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop";
  }
  if (t.includes("eat") || t.includes("dine") || t.includes("dinner") || t.includes("lunch") || t.includes("breakfast") || t.includes("food") || t.includes("restaurant") || t.includes("cafe") || t.includes("tasting") || t.includes("sweet") || t.includes("basundi") || t.includes("jaggery")) {
    return "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop";
  }
  if (t.includes("shop") || t.includes("market") || t.includes("bazaar") || t.includes("mall") || t.includes("buying") || t.includes("souvenir")) {
    return "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop";
  }
  if (t.includes("bar") || t.includes("club") || t.includes("nightlife") || t.includes("pub") || t.includes("drink")) {
    return "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop";
  }
  if (t.includes("park") || t.includes("beach") || t.includes("lake") || t.includes("river") || t.includes("nature") || t.includes("forest") || t.includes("garden") || t.includes("mountain") || t.includes("hill")) {
    return "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&auto=format&fit=crop";
  }
  if (t.includes("temple") || t.includes("church") || t.includes("fort") || t.includes("palace") || t.includes("museum") || t.includes("shrine") || t.includes("history") || t.includes("monument") || t.includes("ruin") || t.includes("castle") || t.includes("hawa mahal") || t.includes("amber")) {
    return "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&auto=format&fit=crop";
  }
  if (t.includes("adventure") || t.includes("hike") || t.includes("trek") || t.includes("ride") || t.includes("climb") || t.includes("safari")) {
    return "https://images.unsplash.com/photo-1533240332313-0db49b439ad3?w=600&auto=format&fit=crop";
  }
  return "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&auto=format&fit=crop";
};

const getUnsplashUrl = (query: string) => {
  const encoded = encodeURIComponent(query);
  // Use Unsplash source API for dynamic real photos
  return `https://source.unsplash.com/600x400/?${encoded}`;
};

const PlaceImage = ({ placeName, destination, className }: { placeName: string; destination?: string; className?: string }) => {
  const cleanedName = placeName
    .replace(/^(visit|explore|enjoy|dinner at|lunch at|breakfast at|sightseeing at|go to|see|tour|walk around|relax at|stay at|check into)\s+/i, '')
    .trim();
  
  const { imageUrl, loading } = useWikipediaImage(cleanedName, "");
  const [imgError, setImgError] = useState(false);
  
  if (loading) {
    return <div className={`bg-slate-100 animate-pulse ${className}`} />;
  }

  // Priority: 1) Wikipedia image, 2) Unsplash with place+destination, 3) category fallback
  const unsplashQuery = destination 
    ? `${cleanedName} ${destination}` 
    : cleanedName;
  
  const primaryUrl = imageUrl || getUnsplashUrl(unsplashQuery);
  const fallbackUrl = getFallbackImageByCategory(placeName);

  return (
    <img
      src={imgError ? fallbackUrl : primaryUrl}
      alt={cleanedName}
      className={`object-cover ${className}`}
      referrerPolicy="no-referrer"
      onError={() => setImgError(true)}
    />
  );
};

interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
}

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

export const TripDetails = () => {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeRegenDay, setActiveRegenDay] = useState<number | null>(null);
  const [regenInstruction, setRegenInstruction] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  
  const [activeAddActivityDay, setActiveAddActivityDay] = useState<number | null>(null);
  const [newActivity, setNewActivity] = useState("");

  const [copied, setCopied] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [companions, setCompanions] = useState<string[]>([]);
  const [showDeleteDayConfirm, setShowDeleteDayConfirm] = useState(false);
  const [pendingDeleteDayInfo, setPendingDeleteDayInfo] = useState<{ day: number; activityIndex: number } | null>(null);

  // Edit Date States
  const [showDateEditDialog, setShowDateEditDialog] = useState(false);
  const [newStartDate, setNewStartDate] = useState("");
  const [newNumberOfDays, setNewNumberOfDays] = useState(5);

  const navigate = useNavigate();

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Trip link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInvite = async () => {
    if (!inviteEmail || !inviteEmail.includes("@")) {
      toast.warning("Please enter a valid companion email address.");
      return;
    }
    try {
      toast.info(`Sending invitation email to ${inviteEmail}...`);
      const res = await api.patch(`/trips/${id}/invite`, { email: inviteEmail });
      setTrip(res.data);
      setCompanions(res.data.companions || []);
      toast.success(`Successfully sent email invitation to ${inviteEmail}!`);
      setInviteEmail("");
      setShowInviteModal(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to send invitation email.");
    }
  };

  useEffect(() => {
    fetchTrip();
  }, [id]);

  const fetchTrip = async () => {
    try {
      const res = await api.get(`/trips/${id}`);
      setTrip(res.data);
      setCompanions(res.data.companions || []);
    } catch (error) {
      console.error(error);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDates = async () => {
    try {
      const res = await api.put(`/trips/${id}`, {
        startDate: newStartDate,
        numberOfDays: newNumberOfDays
      });
      setTrip(res.data);
      setCompanions(res.data.companions || []);
      setShowDateEditDialog(false);
      toast.success("Trip dates updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update trip dates.");
    }
  };

  const handleRemoveActivity = async (day: number, activityIndex: number) => {
    const targetDay = trip?.itinerary.days.find((d) => d.day === day);

    if (targetDay && targetDay.activities.length === 1) {
      setPendingDeleteDayInfo({ day, activityIndex });
      setShowDeleteDayConfirm(true);
      return;
    }

    await confirmRemoveActivity(day, activityIndex, false);
  };

  const confirmRemoveActivity = async (day: number, activityIndex: number, removeDay: boolean) => {
    try {
      const res = await api.patch(`/trips/${id}/remove-activity`, { day, activityIndex, removeDay });
      setTrip(res.data);
      if (removeDay) {
        toast.success(`Day ${day} deleted, and subsequent days rearranged.`);
      } else {
        toast.success("Activity removed successfully.");
      }
    } catch (error) {
      console.error("Failed to remove activity");
      toast.error("Failed to remove activity.");
    } finally {
      setShowDeleteDayConfirm(false);
      setPendingDeleteDayInfo(null);
    }
  };

  const handleAddActivity = async () => {
    if (!newActivity || activeAddActivityDay === null) return;
    try {
      const res = await api.patch(`/trips/${id}/add-activity`, { day: activeAddActivityDay, activity: newActivity });
      setTrip(res.data);
      setNewActivity("");
      setActiveAddActivityDay(null);
      toast.success("Activity added successfully.");
    } catch (error) {
      console.error("Failed to add activity");
      toast.error("Failed to add activity.");
    }
  };

  const handleRegenerateDay = async () => {
    if (activeRegenDay === null || !regenInstruction) return;
    setIsRegenerating(true);
    try {
      const res = await api.patch(`/trips/${id}/regenerate-day`, {
        day: activeRegenDay,
        instruction: regenInstruction
      });
      setTrip(res.data);
      setActiveRegenDay(null);
      setRegenInstruction("");
      toast.success(`Day ${activeRegenDay} successfully regenerated!`);
    } catch (error) {
      console.error("Failed to regenerate day", error);
      toast.error("Failed to regenerate day.");
    } finally {
      setIsRegenerating(false);
    }
  };

  // --- EXPENSE TRACKER STATE & HANDLERS ---
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Stay");

  useEffect(() => {
    if (!id) return;
    const saved = localStorage.getItem(`expenses-${id}`);
    if (saved) {
      setExpenses(JSON.parse(saved));
    } else {
      setExpenses([]);
    }
  }, [id]);

  const handleAddExpense = () => {
    if (!expenseName || !expenseAmount) {
      toast.warning("Please fill in both expense name and amount.");
      return;
    }
    const amountVal = parseFloat(expenseAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      toast.warning("Please enter a valid positive expense amount.");
      return;
    }
    const newExp: Expense = {
      id: Date.now().toString(),
      category: expenseCategory,
      amount: amountVal,
      description: expenseName,
      date: new Date().toLocaleDateString()
    };
    const updated = [...expenses, newExp];
    setExpenses(updated);
    localStorage.setItem(`expenses-${id}`, JSON.stringify(updated));
    setExpenseName("");
    setExpenseAmount("");
    toast.success("Expense logged successfully!");
  };

  const handleRemoveExpense = (expId: string) => {
    const updated = expenses.filter((e) => e.id !== expId);
    setExpenses(updated);
    localStorage.setItem(`expenses-${id}`, JSON.stringify(updated));
    toast.success("Expense removed.");
  };

  // --- MAP & GEOCODING STATE & HANDLERS ---
  const [mapCenter, setMapCenter] = useState<[number, number]>([0, 0]);
  const [markers, setMarkers] = useState<{ id: string; title: string; lat: number; lon: number; leafletMarker?: any }[]>([]);
  const mapInstanceRef = useRef<any>(null);

  // Geocode destination and activities
  useEffect(() => {
    const geocodeAll = async () => {
      if (!trip) return;
      try {
        // Geocode destination
        const destRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trip.destination)}&limit=1`
        );
        const destData = await destRes.json();
        let centerLat = 0;
        let centerLon = 0;
        if (destData && destData.length > 0) {
          centerLat = parseFloat(destData[0].lat);
          centerLon = parseFloat(destData[0].lon);
          setMapCenter([centerLat, centerLon]);
        }

        // Collect all activities
        const activityList: { id: string; title: string }[] = [];
        trip.itinerary.days.forEach((dayPlan) => {
          dayPlan.activities.forEach((act, idx) => {
            activityList.push({
              id: `${dayPlan.day}-${idx}`,
              title: act
            });
          });
        });

        // Geocode up to first 8 activities (to respect Nominatim's usage policy)
        const markerList: any[] = [];
        for (const act of activityList.slice(0, 8)) {
          try {
            const cleanedName = extractPlaceName(act.title);
            const actRes = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanedName + ", " + trip.destination)}&limit=1`
            );
            const actData = await actRes.json();
            if (actData && actData.length > 0) {
              markerList.push({
                id: act.id,
                title: act.title,
                lat: parseFloat(actData[0].lat),
                lon: parseFloat(actData[0].lon)
              });
            }
          } catch (e) {
            console.error("Geocoding failed for:", act.title);
          }
        }

        // Fallback: place markers spread out if Nominatim geocoding doesn't return anything
        if (markerList.length === 0 && centerLat !== 0) {
          activityList.forEach((act, idx) => {
            const offsetLat = (Math.random() - 0.5) * 0.02;
            const offsetLon = (Math.random() - 0.5) * 0.02;
            markerList.push({
              id: act.id,
              title: act.title,
              lat: centerLat + offsetLat,
              lon: centerLon + offsetLon
            });
          });
        }

        setMarkers(markerList);
      } catch (err) {
        console.error("Geocoding failed:", err);
      }
    };

    geocodeAll();
  }, [trip]);

  // Load Leaflet CDN script & stylesheet, initialize Leaflet Map instance
  useEffect(() => {
    if (mapCenter[0] === 0 && mapCenter[1] === 0) return;

    const initMap = () => {
      const container = document.getElementById("leaflet-map");
      if (!container) return;

      // Avoid double initialization
      if ((container as any)._leaflet_id) {
        // Map already initialized — just update view if needed
        return;
      }

      const L = (window as any).L;
      if (!L) return;

      const map = L.map("leaflet-map").setView(mapCenter, 13);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      // Render markers
      markers.forEach((marker) => {
        const customPopup = `
          <div style="font-family: sans-serif; font-size: 12px; padding: 4px; max-width: 150px;">
            <strong style="color: #4f46e5; display: block; margin-bottom: 2px;">Activity</strong>
            <span style="font-weight: 600; color: #1e293b;">${marker.title}</span>
          </div>
        `;
        const leafletMarker = L.marker([marker.lat, marker.lon])
          .addTo(map)
          .bindPopup(customPopup);
        
        marker.leafletMarker = leafletMarker;
      });
    };

    if (!(window as any).L) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);

      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => initMap();
      document.body.appendChild(script);
    } else {
      initMap();
    }
  }, [mapCenter, markers]);

  const handleActivityClick = async (day: number, idx: number) => {
    const markerId = `${day}-${idx}`;
    const map = mapInstanceRef.current;
    let targetMarker = markers.find((m) => m.id === markerId);
    
    if (!targetMarker && map && trip) {
      const dayPlan = trip.itinerary.days.find(d => d.day === day);
      if (dayPlan) {
        const activityText = dayPlan.activities[idx];
        if (activityText) {
          try {
            const cleanedName = extractPlaceName(activityText);
            toast.info(`Locating "${cleanedName}" on map...`);
            const res = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanedName + ", " + trip.destination)}&limit=1`
            );
            const data = await res.json();
            if (data && data.length > 0) {
              const L = (window as any).L;
              let leafletMarker: any = null;
              if (L) {
                const customPopup = `
                  <div style="font-family: sans-serif; font-size: 12px; padding: 4px; max-width: 160px;">
                    <strong style="color: #4f46e5; display: block; margin-bottom: 2px;">Activity</strong>
                    <span style="font-weight: 600; color: #1e293b;">${activityText}</span>
                  </div>
                `;
                leafletMarker = L.marker([parseFloat(data[0].lat), parseFloat(data[0].lon)])
                  .addTo(map)
                  .bindPopup(customPopup);
              }

              const newMarker = {
                id: markerId,
                title: activityText,
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon),
                leafletMarker
              };
              
              setMarkers(prev => [...prev, newMarker]);
              targetMarker = newMarker;
            } else {
              toast.warning(`Could not locate "${cleanedName}". Centering on destination city.`);
              if (mapCenter[0] !== 0 && map) {
                map.setView(mapCenter, 14, { animate: true, duration: 1.0 });
              }
              return;
            }
          } catch (err) {
            console.error("On-demand geocoding failed:", err);
          }
        }
      }
    }
    
    if (targetMarker && map) {
      map.setView([targetMarker.lat, targetMarker.lon], 16, {
        animate: true,
        duration: 0.8
      });
      if (targetMarker.leafletMarker) {
        targetMarker.leafletMarker.openPopup();
      }
    }
  };

  const { imageUrl, loading: imageLoading } = useWikipediaImage(trip?.destination || "");

  if (loading || !trip) return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="flex flex-col items-center gap-4 text-slate-400">
        <div className="w-10 h-10 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
        <p className="text-sm font-semibold">Loading your adventure...</p>
      </div>
    </div>
  );

  const totalBudget = trip.itinerary.budget.total;
  const fltPct = Math.round((trip.itinerary.budget.flights / totalBudget) * 100) || 0;
  const accPct = Math.round((trip.itinerary.budget.accommodation / totalBudget) * 100) || 0;
  const foodPct = Math.round((trip.itinerary.budget.food / totalBudget) * 100) || 0;

  // Safe date calculations — guard against invalid/missing startDate
  const hasValidStartDate = trip.startDate && !isNaN(new Date(trip.startDate).getTime());
  const start = hasValidStartDate ? new Date(trip.startDate) : null;
  const end = start ? new Date(start) : null;
  if (start && end) end.setDate(start.getDate() + (trip.numberOfDays - 1));
  const dateOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  const formattedStartDate = start ? start.toLocaleDateString('en-US', dateOptions) : 'Not set';
  const formattedEndDate = end ? end.toLocaleDateString('en-US', dateOptions) : 'Not set';
  const dateLabel = hasValidStartDate 
    ? `${formattedStartDate} — ${formattedEndDate} (${trip.numberOfDays} Days)` 
    : `${trip.numberOfDays} Days planned`;
  
  const tripStatus = getTripStatus(trip.startDate, trip.numberOfDays);
  
  const badgeColors = {
    upcoming: "bg-indigo-100 text-indigo-700 border-indigo-200",
    active: "bg-emerald-100 text-emerald-700 border-emerald-200 flex items-center gap-1.5",
    completed: "bg-slate-100 text-slate-700 border-slate-200"
  };

  const badgeText = {
    upcoming: "Upcoming",
    active: "Active Now",
    completed: "Completed"
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Print-Only Cover Header */}
      <div className="hidden print:block border-b-4 border-indigo-600 pb-6 mb-8">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block mb-1">Trio Personal Travel Guide</span>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{trip.destination}</h1>
            <p className="text-sm font-semibold text-slate-500 mt-1.5 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-slate-400" />
              <span>{dateLabel}</span>
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Budget Estimate</span>
            <span className="text-2xl font-black text-slate-800">${totalBudget.toLocaleString()}</span>
            <span className="text-xs font-semibold text-slate-500 block">({trip.budgetType} Budget)</span>
          </div>
        </div>
        {companions.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500 font-semibold">
            <strong className="text-slate-700">Companions:</strong>
            <span>{companions.join(', ')}</span>
          </div>
        )}
      </div>

      {/* Header section (replaces Welcome Header) */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between bg-white rounded-2xl border border-slate-200 p-6 shadow-sm print:hidden">
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex flex-wrap items-center gap-3">
              <span>{trip.destination}</span>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${badgeColors[tripStatus]}`}>
                {tripStatus === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />}
                {badgeText[tripStatus]}
              </span>
            </h1>
            <p 
              className="text-slate-500 text-sm font-semibold flex items-center gap-2 cursor-pointer hover:text-indigo-600 transition-colors mt-1.5 no-print"
              onClick={() => {
                setNewStartDate(new Date(trip.startDate).toISOString().split('T')[0]);
                setNewNumberOfDays(trip.numberOfDays);
                setShowDateEditDialog(true);
              }}
              title="Click to edit dates"
            >
              <CalendarIcon className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>{dateLabel}</span>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase tracking-wider scale-90 border border-indigo-100">Edit</span>
            </p>
            {/* Print-only dates display */}
            <p className="hidden print:flex items-center gap-1.5 text-sm text-slate-600 font-semibold mt-1">
              <CalendarIcon className="w-4 h-4 text-slate-500 shrink-0" />
              <span>{dateLabel}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2 no-print">
            <Button variant="outline" size="sm" className="rounded-full flex items-center gap-1.5 font-bold h-9 text-xs" onClick={handleShare}>
              <Share2 className="w-3.5 h-3.5 text-indigo-600" />
              {copied ? "Copied!" : "Share Trip"}
            </Button>
            <Button variant="outline" size="sm" className="rounded-full flex items-center gap-1.5 font-bold h-9 text-xs" onClick={() => setShowInviteModal(true)}>
              <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
              Invite Companions
            </Button>
            <Button variant="outline" size="sm" className="rounded-full flex items-center gap-1.5 font-bold h-9 text-xs" onClick={() => window.print()}>
              <Printer className="w-3.5 h-3.5 text-indigo-600" />
              Export PDF
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-6 self-stretch md:self-auto justify-between border-t border-slate-100 pt-4 md:border-t-0 md:pt-0">
          <div className="flex gap-8">
            <div className="text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Days</p>
              <p className="text-2xl font-bold text-indigo-600">{trip.numberOfDays}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Budget Type</p>
              <p className="text-2xl font-bold text-slate-800 tracking-tight">{trip.budgetType}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Main Active Trip Bento */}
        <div className="flex-grow lg:w-2/3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="h-48 md:h-64 bg-slate-900 relative shrink-0 overflow-hidden">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={trip.destination} 
                className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-overlay transition-opacity duration-1000 ease-in-out" 
                referrerPolicy="no-referrer"
              />
            ) : (
               <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-600 opacity-60"></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
            <div className="absolute bottom-6 left-6 md:left-8 right-6 md:right-8 text-white z-10 flex flex-col items-start">
              <span className="bg-indigo-500/80 backdrop-blur-md text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-flex items-center gap-1">
                <Map className="w-3 h-3" /> {tripStatus === 'active' ? 'Active Now' : tripStatus === 'completed' ? 'Completed' : 'Upcoming'} Itinerary
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight drop-shadow-lg line-clamp-1">{trip.destination}</h2>
              <div className="flex flex-wrap gap-2 mt-3">
                {trip.interests.map((interest, i) => (
                  <span key={i} className="text-xs font-semibold tracking-wide bg-white/20 text-white px-3 py-1.5 rounded-full backdrop-blur-md border border-white/20 shadow-sm">{interest}</span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Connected timeline daily schedule */}
          <div className="p-4 md:p-6 flex flex-col gap-8 scroll-smooth">
            {trip.itinerary.days.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-4">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shadow-inner animate-pulse">
                  <Compass className="w-8 h-8 text-indigo-500" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-800">Your Itinerary is Empty</h3>
                  <p className="text-sm text-slate-500 max-w-sm">You have removed all days and activities. Add a new activity to start planning again!</p>
                </div>
                <div className="pt-2">
                  <Button 
                    onClick={() => setActiveAddActivityDay(1)} 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 border-none outline-none cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-white" /> Add Day 1 Activity
                  </Button>
                </div>
              </div>
            ) : (
              trip.itinerary.days.map((dayPlan) => (
                <div key={dayPlan.day} className="flex flex-col gap-4 border-b border-slate-100 pb-8 last:border-0 last:pb-0 print-day-block">
                  {/* Day header + quick tools row */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-400 uppercase">Day {dayPlan.day}: {dayPlan.title}</h3>
                    <div className="flex items-center gap-1 no-print">
                      <button onClick={() => setActiveRegenDay(dayPlan.day)} className="text-xs font-bold hover:bg-indigo-50 px-2 py-1 rounded text-indigo-600 transition-colors cursor-pointer border border-transparent hover:border-indigo-100">Regenerate</button>
                      <button onClick={() => setActiveAddActivityDay(dayPlan.day)} className="text-xs font-bold hover:bg-indigo-50 px-2 py-1 rounded text-indigo-600 transition-colors cursor-pointer border border-transparent hover:border-indigo-100">+ Add</button>
                    </div>
                  </div>
                  {/* Timeline activities */}
                  <div className="relative pl-6 border-l border-slate-200 ml-4 space-y-5">
                    {dayPlan.activities.map((activity, idx) => {
                      const colorVariants = [
                        { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200" },
                        { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
                        { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-200" },
                        { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
                      ];
                      const v = colorVariants[idx % colorVariants.length];
                      
                      return (
                        <div 
                          key={idx} 
                          className="group relative bg-white border border-slate-200/60 rounded-2xl p-4 flex flex-row gap-4 items-center hover:border-indigo-400 hover:shadow-sm transition-all duration-300 cursor-pointer"
                          onClick={() => handleActivityClick(dayPlan.day, idx)}
                        >
                          {/* Connected timeline node */}
                          <div className="absolute -left-[31px] top-5 w-2.5 h-2.5 rounded-full border-2 border-white bg-indigo-600 shadow-sm" />

                          {/* Dynamic actual place image preview */}
                          <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                            <PlaceImage placeName={activity} destination={trip.destination} className="w-full h-full" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${v.bg} ${v.text} border ${v.border}`}>
                                Activity 0{idx + 1}
                              </span>
                            </div>
                            <p className="text-sm font-bold text-slate-800 leading-snug line-clamp-2">{activity}</p>
                            <p className="text-[11px] text-slate-400 font-semibold mt-1.5 group-hover:text-indigo-600 transition-colors flex items-center gap-1">
                              <Compass className="w-3 h-3" /> Click to show on map
                            </p>
                          </div>

                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 h-8 w-8 px-0 shrink-0 bg-white/80 no-print" 
                            onClick={(e) => {
                              e.stopPropagation(); 
                              handleRemoveActivity(dayPlan.day, idx);
                            }}
                            title="Remove Activity"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
            )))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:w-1/3 flex flex-col gap-6">
          
          {/* Leaflet Map Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm overflow-hidden flex flex-col h-[320px] shrink-0 no-print lg:sticky lg:top-20" style={{ zIndex: 5 }}>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Map className="w-4 h-4 text-indigo-500" /> Live Route Map
            </h3>
            <div className="flex-1 bg-slate-100 rounded-xl overflow-hidden relative border border-slate-100">
              <div id="leaflet-map" className="h-full w-full" />
              {mapCenter[0] === 0 && (
                <div className="absolute inset-0 bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-400">
                  Loading Map Route...
                </div>
              )}
            </div>
          </div>

          {/* Interactive Expense Tracker */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col shrink-0 no-print">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-indigo-500" /> Trip Budget Tracker
            </h3>
            
            {/* SVG budget progress circular gauge */}
            {(() => {
              const actualSpent = expenses.reduce((acc, e) => acc + e.amount, 0);
              const spentPct = totalBudget > 0 ? Math.min((actualSpent / totalBudget) * 100, 200) : 0;
              const radius = 36;
              const circumference = 2 * Math.PI * radius;
              const strokeOffset = circumference - (Math.min(spentPct, 100) / 100) * circumference;
              const isOverBudget = actualSpent > totalBudget;

              return (
                <div className="flex items-center gap-5 bg-slate-50 border border-slate-100 p-4 rounded-2xl mb-4">
                  <div className="relative w-20 h-20 shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="40" cy="40" r={radius} className="stroke-slate-200 fill-none" strokeWidth="6" />
                      <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        className={`fill-none transition-all duration-500 ${isOverBudget ? "stroke-red-500 animate-pulse" : "stroke-indigo-600"}`}
                        strokeWidth="6"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeOffset}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className={`text-xs font-black ${isOverBudget ? "text-red-500" : "text-slate-800"}`}>
                        {Math.round(totalBudget > 0 ? (actualSpent / totalBudget) * 100 : 0)}%
                      </span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">spent</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col mb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Spent / Budget</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className={`text-lg font-black tracking-tight ${isOverBudget ? "text-red-500" : "text-slate-800"}`}>
                          ${actualSpent.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-400">/ ${totalBudget.toLocaleString()}</span>
                      </div>
                    </div>
                    {isOverBudget ? (
                      <span className="text-[10px] font-semibold text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded">Over Budget!</span>
                    ) : (
                      <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">Within Budget</span>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Log expense fields */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Expense name"
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  value={expenseName}
                  onChange={(e) => setExpenseName(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Cost in USD"
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <select
                  className="flex-1 px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 focus:outline-none focus:border-indigo-500 focus:bg-white cursor-pointer"
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                >
                  <option value="Stay">Lodging</option>
                  <option value="Food">Food / Dining</option>
                  <option value="Transit">Transit</option>
                  <option value="Activity">Activities</option>
                  <option value="Misc">Other</option>
                </select>
                <Button onClick={handleAddExpense} className="h-8 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white rounded-lg">
                  Log Expense
                </Button>
              </div>
            </div>

            {/* List logged expenses */}
            {expenses.length > 0 && (
              <div className="mt-4 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {expenses.map((exp) => (
                  <div key={exp.id} className="flex justify-between items-center bg-slate-50 px-2.5 py-2 border border-slate-100 rounded-lg group text-[11px] font-semibold text-slate-700">
                    <div className="flex flex-col min-w-0">
                      <span className="truncate text-slate-800 leading-snug">{exp.description}</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">{exp.category} • {exp.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                      <span className="font-bold text-slate-800">${exp.amount}</span>
                      <button onClick={() => handleRemoveExpense(exp.id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Budget Breakdown Bento */}
          <div className="bg-indigo-900 rounded-2xl p-6 text-white flex flex-col shadow-sm">
            <h3 className="text-xs font-bold text-white/50 uppercase mb-4">Budget Estimate</h3>
            <div className="flex justify-between items-end mb-2">
              <span className="text-4xl font-light">${totalBudget.toLocaleString()}</span>
            </div>
            <div className="space-y-4 mt-6">
              <div className="flex h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-400" style={{ width: `${fltPct}%` }}></div>
                <div className="h-full bg-indigo-300" style={{ width: `${accPct}%` }}></div>
                <div className="h-full bg-indigo-200" style={{ width: `${foodPct}%` }}></div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-white/80">
                <div className="flex justify-between"><span>Flights</span><span>${trip.itinerary.budget.flights}</span></div>
                <div className="flex justify-between"><span>Stay</span><span>${trip.itinerary.budget.accommodation}</span></div>
                <div className="flex justify-between"><span>Food</span><span>${trip.itinerary.budget.food}</span></div>
                <div className="flex justify-between"><span>Activities</span><span>${trip.itinerary.budget.activities}</span></div>
                <div className="flex justify-between col-span-2"><span>Transit</span><span>${trip.itinerary.budget.transportation}</span></div>
              </div>
            </div>
          </div>

          {/* Hotel Suggestions Bento */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col flex-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">AI Hotel Picks</h3>
            <div className="space-y-6 overflow-y-auto pr-2 max-h-[350px]">
              {trip.itinerary.hotels.map((hotel, idx) => {
                const colors = [
                  { label: "text-indigo-600" },
                  { label: "text-teal-600" },
                  { label: "text-orange-600" },
                ];
                const color = colors[idx % colors.length];
                return (
                  <div key={idx} className="group flex gap-3.5 items-start">
                    {/* Hotel dynamic photo preview */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-100 bg-slate-50">
                      <PlaceImage placeName={hotel.name} destination={trip.destination} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-[10px] font-black ${color.label} uppercase tracking-widest mb-0.5`}>{hotel.category}</p>
                      <p className="text-xs font-bold text-slate-800 leading-normal truncate">{hotel.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium leading-relaxed line-clamp-2 mt-0.5">{hotel.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* AI Travel Companion Bento */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 shrink-0 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"></path><path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"></path></svg>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Your AI Companion Details</p>
            <p className="text-xs text-slate-500 mt-1">Essential knowledge prepared for your journey.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-2">Packing</span>
             <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
               {trip.itinerary.travelTips.packing.slice(0,4).map((t, i) => <li key={i}>{t}</li>)}
             </ul>
          </div>
          <div className="hidden md:block w-px bg-slate-100"></div>
          <div>
             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-2">Safety</span>
             <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
               {trip.itinerary.travelTips.safety.slice(0,4).map((t, i) => <li key={i}>{t}</li>)}
             </ul>
          </div>
          <div className="hidden md:block w-px bg-slate-100"></div>
          <div className="md:col-span-1 space-y-4">
             <div>
               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-2">Local Etiquette</span>
               <p className="text-xs text-slate-600 leading-relaxed">{trip.itinerary.travelTips.localEtiquette[0]}</p>
             </div>
             <div>
               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-2">Weather Advice</span>
               <p className="text-xs text-slate-600 leading-relaxed">{trip.itinerary.travelTips.weatherAdvice[0]}</p>
             </div>
          </div>
        </div>
      </div>

      {/* Regenerate Day Dialog */}
      <Dialog open={activeRegenDay !== null} onOpenChange={(open) => !open && setActiveRegenDay(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regenerate Day {activeRegenDay}</DialogTitle>
            <DialogDescription>
              Tell our AI exactly what you'd like to change about this day.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input 
              value={regenInstruction} 
              onChange={(e) => setRegenInstruction(e.target.value)}
              placeholder="e.g. Make it more outdoor focused, skip the museum..."
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRegenerateDay()
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveRegenDay(null)}>Cancel</Button>
            <Button onClick={handleRegenerateDay} className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isRegenerating || !regenInstruction}>
              {isRegenerating ? "Generating..." : "Apply Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Activity Dialog */}
      <Dialog open={activeAddActivityDay !== null} onOpenChange={(open) => !open && setActiveAddActivityDay(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Activity to Day {activeAddActivityDay}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input 
              value={newActivity} 
              onChange={(e) => setNewActivity(e.target.value)}
              placeholder="e.g. Dinner at the local steakhouse"
              onKeyDown={(e) => {
                if(e.key === "Enter") handleAddActivity()
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveAddActivityDay(null)}>Cancel</Button>
            <Button onClick={handleAddActivity} className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={!newActivity}>Add Activity</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Companions Dialog */}
      <Dialog open={showInviteModal} onOpenChange={(open) => !open && setShowInviteModal(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Companions</DialogTitle>
            <DialogDescription>
              Share this trip with your travel companions to collaborate on the itinerary!
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
              <Input 
                value={inviteEmail} 
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="e.g. sophia.explorer@gmail.com"
                type="email"
                onKeyDown={(e) => {
                  if(e.key === "Enter") handleInvite()
                }}
              />
            </div>
            
            {companions.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Invited Companions</label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {companions.map((email, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 border border-slate-100">
                      <span>{email}</span>
                      <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider bg-green-50 px-2 py-0.5 rounded border border-green-100">Active</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteModal(false)}>Close</Button>
            <Button onClick={handleInvite} className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={!inviteEmail || !inviteEmail.includes("@")}>
              Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Day Confirmation Dialog */}
      <Dialog open={showDeleteDayConfirm} onOpenChange={(open) => !open && setShowDeleteDayConfirm(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" /> Delete Empty Day?
            </DialogTitle>
            <DialogDescription className="text-slate-500 pt-2 leading-relaxed">
              Removing this activity will leave <strong>Day {pendingDeleteDayInfo?.day}</strong> empty. 
              Would you like to completely remove this day and shorten your trip to <strong>{Math.max(1, (trip?.numberOfDays || 1) - 1)} days</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeleteDayConfirm(false);
                setPendingDeleteDayInfo(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white font-bold" 
              onClick={() => {
                if (pendingDeleteDayInfo) {
                  confirmRemoveActivity(pendingDeleteDayInfo.day, pendingDeleteDayInfo.activityIndex, true);
                }
              }}
            >
              Delete Day
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dates Dialog */}
      <Dialog open={showDateEditDialog} onOpenChange={(open) => !open && setShowDateEditDialog(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-indigo-600" /> Edit Trip Dates & Duration
            </DialogTitle>
            <DialogDescription className="text-slate-500 pt-2 leading-relaxed">
              Modify the start date or duration of your trip. The itinerary end date will be updated automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Start Date</label>
              <Input 
                type="date" 
                value={newStartDate} 
                onChange={(e) => setNewStartDate(e.target.value)} 
                className="h-12 border-slate-200 focus-visible:ring-indigo-600 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Duration (Days)</label>
              <Input 
                type="number" 
                min="1" max="30"
                value={newNumberOfDays} 
                onChange={(e) => setNewNumberOfDays(parseInt(e.target.value) || 1)} 
                className="h-12 border-slate-200 focus-visible:ring-indigo-600 text-sm"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setShowDateEditDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold" 
              onClick={handleUpdateDates}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};
