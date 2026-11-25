# CarPool India — Live Route, AC Meter & Fair-Split App

A 100% free, zero-backend, mobile-responsive carpooling calculator built for Indian roads and vehicles (2006 Alto 800 to 2026 EVs).

---

## System Design

```
+---------------------------------------------------------------+
|                   Client Browser (Static SPA)                 |
|  index.html + styles.css (Retro-Futuristic Glassmorphism UI)  |
+-------------------------------+-------------------------------+
                                |
        +-----------------------+-----------------------+
        v                       v                       v
+---------------+      +----------------+      +----------------+
|   app.js      |      | cars-india.js  |      | ai-optimizer.js|
| State, GPS,   |      | 2006–2026 Cars |      | Nearest-Neighbor|
| Chat Billing  |      | & City Fuel ₹  |      | Detour & Idle  |
+-------+-------+      +----------------+      +----------------+
        |
        +--------------------+--------------------+
        v                    v                    v
+---------------+   +----------------+   +----------------+
| Nominatim API |   |   OSRM API     |   | Browser GPS    |
| (India Places)|   | (Road Distance)|   | (watchPosition)|
+---------------+   +----------------+   +----------------+
```

### Core Modules
1. **Trip Points & Live Routing (`app.js`)**:
   - **No Map Load on Startup**: Users enter **1. Starting Point**, **2. Sharing Point(s)**, and **3. Destination Point** first; OSRM computes real driving distances in the background.
   - **Optional Interactive Map**: Clicking **Open Map** loads Leaflet + OpenStreetMap tiles on demand.
2. **Vehicle & Fuel Engine (`cars-india.js`)**:
   - Searchable database of Indian cars (2006–2026) across Petrol, Diesel, CNG, and EV.
   - Present city fuel presets (Hyderabad, New Delhi, Mumbai, Bengaluru) + custom override.
3. **AI Optimizer & Cost Predictor (`ai-optimizer.js`)**:
   - **AI Optimize**: Nearest-neighbor solver that reorders middle sharing stops (keeping Start & Destination fixed) to minimize total km.
   - **Traffic & Rested Time AC Idle**: Computes idling fuel burned during traffic waits and AC-on rest breaks.
   - **Fair-Share Modes**: Fair Segment Split, AI Detour Fair-Share, and Flat Equal Split, presented as a **Per-Person Cost Chat**.

---

## Free Deployment & CI/CD

This project uses **GitHub Actions + GitHub Pages** (100% free, no credit card required) via `.github/workflows/deploy.yml`:
1. **CI (`validate` job)**: Runs `node --check` on all JS files and verifies required assets on every push to `main`.
2. **CD (`deploy` job)**: Automatically publishes the static site to GitHub Pages.

### Steps to Deploy Free
1. Create a public GitHub repository and push this folder to the `main` branch.
2. In GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Your live URL (`https://<username>.github.io/<repo>/`) will be deployed automatically!
