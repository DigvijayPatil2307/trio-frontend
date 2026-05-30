export interface User {
  _id: string;
  name: string;
  email: string;
  token?: string;
}

export interface Activity {
  title: string;
  activities: string[];
}

export interface DayPlan {
  day: number;
  title: string;
  activities: string[];
}

export interface TripItinerary {
  destination: string;
  days: DayPlan[];
  budget: {
    flights: number;
    accommodation: number;
    food: number;
    activities: number;
    transportation: number;
    total: number;
  };
  hotels: {
    name: string;
    category: string;
    description: string;
  }[];
  travelTips: {
    packing: string[];
    safety: string[];
    localEtiquette: string[];
    weatherAdvice: string[];
  };
}

export interface Trip {
  _id: string;
  userId: string;
  destination: string;
  numberOfDays: number;
  budgetType: "Low" | "Medium" | "High";
  interests: string[];
  itinerary: TripItinerary;
  createdAt: string;
  updatedAt: string;
}
