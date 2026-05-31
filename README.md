# 🎨 Trio.ai Frontend

## Overview

The Trio.ai Frontend is a modern React application that provides an intuitive and responsive user interface for AI-powered travel planning. Users can create personalized trips, view AI-generated itineraries, manage travel plans, explore destinations on interactive maps, and collaborate with travel companions.

The frontend communicates with the backend through secure REST APIs and provides a seamless user experience across desktop and mobile devices.

---

## Tech Stack

### Core Technologies

* React 19
* TypeScript
* Vite
* React Router DOM

### UI & Styling

* Tailwind CSS
* Shadcn UI
* Lucide React Icons
* Motion Animations

### Forms & Validation

* React Hook Form
* Zod Validation

### API Communication

* Axios

### Maps & Visualization

* Leaflet
* OpenStreetMap

---

## Local Setup

### Prerequisites

* Node.js 18+
* npm

### Installation

```bash
git clone <frontend-repository-url>
cd trio-frontend
npm install
```

### Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:3000/api
```

### Run Development Server

```bash
npm run dev
```

Application will run on:

```text
http://localhost:5173
```

---

## Production Deployment

Frontend is deployed on Vercel.

Required Environment Variables:

```env
VITE_API_URL=<backend-api-url>/api
```

Example:

```env
VITE_API_URL=https://trio-backend-ortk.onrender.com/api
```

---

## Application Architecture

The frontend follows a component-driven architecture:

```text
Pages
│
├── Authentication
├── Dashboard
├── Trip Planner
├── Trip Details
└── Profile

Components
│
├── UI Components
├── Forms
├── Maps
├── Cards
└── Layouts

Services
│
└── Axios API Layer
```

---

## Authentication Flow

1. User registers or logs in.
2. Backend returns JWT token.
3. Token is stored in Local Storage.
4. Axios interceptor automatically attaches token to every protected request.
5. Protected routes validate authentication state.

---

## Key Features

### AI Trip Generation

Generate personalized travel plans using AI-generated recommendations.

### Interactive Maps

View activities and destinations directly on an interactive map.

### Day Regeneration

Regenerate individual travel days without affecting the complete itinerary.

### Responsive Design

Fully responsive experience across desktop, tablet, and mobile devices.

### Companion Collaboration

Invite travel companions through email.

---

## Design Decisions

### React + Vite

Chosen over Next.js for faster development, simpler deployment, and significantly faster build times.

### TypeScript

Provides strong type safety and improved maintainability.

### Axios Interceptors

Centralized authentication handling and request management.

### Component Reusability

Shared UI components reduce duplication and improve maintainability.

---

## Known Limitations

* Requires backend availability for all AI features.
* Free-tier deployment platforms may introduce cold-start delays.
* Map locations depend on geocoding accuracy.
* Some AI-generated activities may require manual verification.

---
