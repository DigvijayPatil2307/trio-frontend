import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../lib/ToastContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { MapPin, ArrowLeft, ArrowRight, Coins, Compass, CalendarDays, Sparkles } from "lucide-react";

const INTEREST_OPTIONS = [
  "Food", "Culture", "Adventure", "Shopping", "Nightlife", "Nature", "History"
];

const tripSchema = z.object({
  destination: z.string().min(2, "Destination must be at least 2 characters"),
  numberOfDays: z.number().min(1, "At least 1 day required").max(30, "Max 30 days allowed"),
  budgetType: z.enum(["Low", "Medium", "High"]),
  startDate: z.string().min(1, "Start date is required"),
});

type TripFormValues = z.infer<typeof tripSchema>;

export const CreateTrip = () => {
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const loadingMessages = [
    "Generating your itinerary...",
    "Finding the best activities...",
    "Calculating your budget...",
    "Selecting hotel recommendations...",
    "Adding some travel tips..."
  ];

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % loadingMessages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const { register, handleSubmit, formState: { errors }, setValue, watch, trigger } = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      budgetType: "Medium",
      destination: "",
      numberOfDays: 5,
      startDate: new Date().toISOString().split("T")[0],
    }
  });

  const destinationValue = watch("destination");
  const numberOfDaysValue = watch("numberOfDays");
  const budgetTypeValue = watch("budgetType");

  // Manually register fields that aren't bound with {...register}
  useEffect(() => {
    register("destination");
  }, [register]);

  // Debounced autocomplete suggestions fetching
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=10&addressdetails=1`
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          const cityNames = data
            .map((item: any) => {
              const addr = item.address;
              if (!addr) return item.display_name.split(',').slice(0, 3).join(',').trim();
              
              // Extract settlement name
              const name = addr.city || addr.town || addr.village || addr.municipality || addr.county || addr.state || addr.island;
              if (!name) return null;
              
              const region = addr.state || addr.region || "";
              const country = addr.country || "";
              
              let formatted = name;
              if (region && region.toLowerCase() !== name.toLowerCase()) {
                formatted += `, ${region}`;
              }
              if (country) {
                formatted += `, ${country}`;
              }
              return formatted;
            })
            .filter(Boolean) as string[];
          
          // Remove duplicates
          const uniqueSuggestions = Array.from(new Set(cityNames));
          setSuggestions(uniqueSuggestions);
        }
      } catch (err) {
        console.error("Failed to fetch autocomplete suggestions:", err);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const nextStep = async () => {
    if (step === 1) {
      const isValid = await trigger("destination");
      if (isValid) setStep(2);
    } else if (step === 2) {
      const isValid = await trigger(["numberOfDays", "startDate"]);
      if (isValid) setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const onSubmit = async (data: TripFormValues) => {
    if (selectedInterests.length === 0) {
      toast.warning("Please select at least one interest");
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.post("/trips", {
        ...data,
        interests: selectedInterests
      });
      navigate(`/trip/${res.data._id}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate itinerary. Ensure API keys are set.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-pulse">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <div className="text-center space-y-2 text-slate-800">
          <h2 className="text-2xl font-bold text-slate-800">{loadingMessages[loadingMsgIdx]}</h2>
          <p className="text-slate-500">This might take a minute or two...</p>
        </div>
      </div>
    );
  }

  const stepTitles = ["Destination", "Duration", "Budget", "Interests"];

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm p-8 md:p-10 relative overflow-hidden transition-all">
      {/* Progress header */}
      <div className="mb-10 space-y-3">
        <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
          <span>Step {step} of 4: {stepTitles[step - 1]}</span>
          <span className="text-indigo-600">{Math.round((step / 4) * 100)}% Complete</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-600 rounded-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* STEP 1: DESTINATION */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-10 duration-200">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-800">Where are we going?</h2>
              <p className="text-sm text-slate-500">Enter your destination. Our smart autocomplete finds cities worldwide.</p>
            </div>
            <div className="space-y-2 relative">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Destination City</label>
              <Input 
                className="h-14 border-slate-200 focus-visible:ring-indigo-600 text-base" 
                placeholder="e.g. Kyoto, Japan"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setValue("destination", e.target.value, { shouldValidate: true });
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => {
                  setTimeout(() => setShowDropdown(false), 200);
                }}
                autoComplete="off"
              />
              {showDropdown && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-56 overflow-y-auto">
                  {suggestions.map((sug, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-3.5 hover:bg-indigo-50 cursor-pointer text-sm font-semibold text-slate-700 flex items-center gap-2 transition-colors border-b border-slate-100 last:border-b-0"
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevents input blur before state updates
                        setQuery(sug);
                        setValue("destination", sug, { shouldValidate: true });
                        setSuggestions([]);
                        setShowDropdown(false);
                      }}
                    >
                      <MapPin className="w-4.5 h-4.5 text-indigo-500 shrink-0" />
                      <span>{sug}</span>
                    </div>
                  ))}
                </div>
              )}
              {errors.destination && <p className="text-red-500 text-sm">{errors.destination.message}</p>}
            </div>
          </div>
        )}

        {/* STEP 2: DURATION */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-10 duration-200">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-800">How long is the trip?</h2>
              <p className="text-sm text-slate-500">Specify the dates and duration you plan to travel.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Number of Days</label>
                <Input 
                  className="h-14 border-slate-200 focus-visible:ring-indigo-600 text-base"
                  type="number" 
                  {...register("numberOfDays", { valueAsNumber: true })} 
                  placeholder="e.g. 5" 
                  min="1" max="30" 
                />
                {errors.numberOfDays && <p className="text-red-500 text-sm">{errors.numberOfDays.message}</p>}
              </div>

              {/* Quick Select Presets */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Popular Presets</label>
                <div className="flex flex-wrap gap-2">
                  {[3, 5, 7, 10, 14].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setValue("numberOfDays", d, { shouldValidate: true })}
                      className={`px-4 py-2 border rounded-full text-xs font-bold transition-all cursor-pointer ${
                        numberOfDaysValue === d
                          ? "bg-indigo-600 border-transparent text-white"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {d} Days
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Date Picker */}
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Start Date</label>
                <Input 
                  className="h-14 border-slate-200 focus-visible:ring-indigo-600 text-base"
                  type="date" 
                  {...register("startDate")} 
                />
                {errors.startDate && <p className="text-red-500 text-sm">{errors.startDate.message}</p>}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: BUDGET */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-10 duration-200">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-800">Select your budget style</h2>
              <p className="text-sm text-slate-500">Pick a budget flow. Our AI will align lodging, transit, and activities accordingly.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { 
                  value: "Low", 
                  title: "Backpacker", 
                  desc: "Save more, explore street local options and budget stays.", 
                  icon: Coins, 
                  colorClass: "bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100/50" 
                },
                { 
                  value: "Medium", 
                  title: "Standard", 
                  desc: "Balanced spend, comfortable stays, and prime sights.", 
                  icon: Compass, 
                  colorClass: "bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100/50" 
                },
                { 
                  value: "High", 
                  title: "Luxury", 
                  desc: "High-end stays, premier dining, and private guides.", 
                  icon: Sparkles, 
                  colorClass: "bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100/50" 
                }
              ].map((b) => {
                const Icon = b.icon;
                const isSelected = budgetTypeValue === b.value;
                return (
                  <div
                    key={b.value}
                    onClick={() => setValue("budgetType", b.value as "Low"|"Medium"|"High")}
                    className={`border p-5 rounded-2xl cursor-pointer flex flex-col justify-between text-left transition-all hover:scale-101 select-none h-44 ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/20 shadow-md ring-2 ring-indigo-600/10"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${b.colorClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      {isSelected && (
                        <span className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm">✓</span>
                      )}
                    </div>
                    <div className="mt-4">
                      <h3 className="font-bold text-slate-800 text-base">{b.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-normal">{b.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: INTERESTS */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-10 duration-200">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-800">What are your interests?</h2>
              <p className="text-sm text-slate-500">Select one or more interests. Our AI will curate activities matching your vibes.</p>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Interests (Select multiple)</label>
              <div className="flex flex-wrap gap-2.5">
                {INTEREST_OPTIONS.map(interest => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <Badge
                      key={interest}
                      variant={isSelected ? "default" : "outline"}
                      className={`cursor-pointer px-5 py-3 text-sm transition-all rounded-xl font-semibold select-none ${
                        isSelected 
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white border-transparent shadow-sm scale-102" 
                          : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                      onClick={() => toggleInterest(interest)}
                    >
                      {interest}
                    </Badge>
                  );
                })}
              </div>
              {selectedInterests.length === 0 && (
                <p className="text-slate-400 text-xs">Select at least one interest to generate the trip.</p>
              )}
            </div>
          </div>
        )}

        {/* STEP ACTIONS */}
        <div className="flex justify-between items-center pt-6 border-t border-slate-100">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              className="px-6 h-12 rounded-xl flex items-center gap-2 text-slate-600 font-bold border-slate-200 hover:bg-slate-50 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <Button
              type="button"
              onClick={nextStep}
              className="px-6 h-12 bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-2 font-bold cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              className="px-8 h-12 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-100"
              disabled={selectedInterests.length === 0}
            >
              <span>Create Itinerary</span>
              <Sparkles className="w-4 h-4 text-white" />
            </Button>
          )}
        </div>

      </form>
    </div>
  );
};
