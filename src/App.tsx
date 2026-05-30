import { Routes, Route } from "react-router-dom";
import { LandingPage } from "./components/LandingPage";
import { Login, Register } from "./components/Auth";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { CreateTrip } from "./components/CreateTrip";
import { TripDetails } from "./components/TripDetails";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create" element={<CreateTrip />} />
        <Route path="/trip/:id" element={<TripDetails />} />
      </Route>
    </Routes>
  );
}
