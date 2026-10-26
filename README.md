<div align="center">

# 🌊 NaaliWatch (نالی واچ)
### AI-Powered Civic Hazard Intelligence & Urban Drainage Monitoring Platform
**Built for the Google Developer Groups (GDG) Buildathon / Hackathon 2026**

[![Next.js](https://img.shields.io/badge/Next.js-15.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-1.5_Flash-4285F4?style=for-the-badge&logo=google)](https://aistudio.google.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.38-C5F74F?style=for-the-badge&logo=drizzle)](https://orm.drizzle.team/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?style=for-the-badge&logo=leaflet)](https://leafletjs.com/)

<p align="center">
  <b>Empowering citizens of Peshawar to report drainage blocks, open manholes, and urban floods in real time — triaged autonomously by Google Gemini Vision and dispatched directly to Water and Sanitation Services Peshawar (WSSP).</b>
</p>

[Key Features](#-key-features) • [Visual Showcase](#-visual-showcase) • [Architecture](#-system-architecture) • [Tech Stack](#-tech-stack) • [Quickstart Guide](#-quickstart-guide) • [Database & Seeding](#-database--seed-data) • [Roadmap](#-future-roadmap)

---

</div>

## 📌 The Problem: Urban Drainage Crisis in Peshawar

During torrential rains and flash monsoon seasons in Khyber Pakhtunkhwa, Peshawar's historic urban corridors and low-lying zones (such as **Gulbahar**, **Hashtnagri**, **Kohati Gate**, and **Charsadda Road**) face catastrophic urban waterlogging. 

- **Deadly Hazards**: Unmarked open manholes submerged beneath rainwater pose fatal risks to pedestrians, motorcyclists, and schoolchildren.
- **Economic Paralysis**: Critical commercial hubs like Saddar Bazar and Ring Road experience gridlock when drainage lines choke with solid waste and silt.
- **Municipal Information Gap**: The Water and Sanitation Services Peshawar (**WSSP**) relies on fragmented phone calls and manual patrols, lacking accurate geo-tagged visual evidence, severity classification, and proof of resolution.

---

## 💡 The Solution: NaaliWatch

**NaaliWatch** bridges the divide between citizens and municipal authorities with an intelligent, crowdsourced civic tech ecosystem:

1. **Multimodal Gemini Vision Triage**: Citizens take a photo of a clogged drain or puddle. Google's **Gemini 1.5 Flash** instantly classifies the hazard type, detects Urdu/English landmark signage, calculates flood depth severity (`ankle`, `knee`, `danger`), and auto-writes a formal bilingual municipal complaint in both English and Urdu.
2. **Interactive Real-Time Leaflet Map**: Reports are projected onto an interactive live map of Peshawar with custom animated droplet pins color-coded by hazard urgency.
3. **Crowdsourced Validation & Ground-Truth Verification**: Nearby residents upvote active issues to verify legitimacy. Once authorities mark an issue fixed, citizens vote (`Yes` / `No`) to certify real-world resolution before closure.
4. **Peshawar Area Civic Scoreboard**: A transparent public leaderboard ranking Peshawar's administrative sectors by resolution speed, response rate, and citizen satisfaction — driving municipal accountability.
5. **Full Urdu (RTL) & Pashto Localization**: Designed from the ground up for inclusivity with seamless toggle between English and Urdu RTL typography.
6. **Automated WSSP Dispatch**: High-severity reports trigger automated email dispatch packets to WSSP response teams with GPS coordinates, photos, and AI triage summaries.

---

## 📸 Visual Showcase

### 1. Real-Time Interactive Hazard Map (Peshawar)
Interactive geospatial map displaying live reports across Hayatabad, Gulbahar, Saddar, University Town, and Hashtnagri with dynamic urgency indicators and quick filter chips.

![Live Map Dashboard](docs/screenshots/01_live_map_dashboard.png)

---

### 2. Google Gemini Multimodal AI Triage & Complaint Generation
When a citizen uploads a photo, Google Gemini 1.5 Flash scans the image, flags the hazard type, estimates flood depth, extracts signboard landmarks, and generates official complaints in English and Urdu.

![Gemini AI Reporting](docs/screenshots/02_gemini_ai_reporting.png)

---

### 3. Native Urdu (RTL) Localization
First-class support for Urdu with right-to-left layout alignment, native Urdu typography, localized filter pills, status labels, and emergency alerts.

![Urdu RTL Bilingual](docs/screenshots/03_urdu_rtl_bilingual.png)

---

### 4. Peshawar Civic Scoreboard & Municipal Accountability
Public accountability dashboard ranking administrative zones across Peshawar by total complaints, resolution percentage, and average response times.

![Civic Scoreboard](docs/screenshots/04_peshawar_civic_scoreboard.png)

---

### 5. Citizen Mission & Impact Overview
Comprehensive portal explaining the civic mission, problem statement, emergency hotlines (WSSP 1334, PDMA 1700), and guide for active citizen participation.

![Mission and Overview](docs/screenshots/05_mission_and_overview.png)

---

### 6. Active Live Feed & Verification Drawer
Citizen feed showing real-time community upvotes, photo previews, verification badges, and direct submission flow.

![Active Reports Feed](docs/screenshots/06_active_reports_feed.png)

---

## ⚡ Key Features

| Feature | Description |
|---|---|
| 🤖 **Gemini 1.5 Flash Vision** | Multimodal AI that detects open manholes, standing water, and blocked drains with high confidence |
| 📍 **Live Geolocation Mapping** | Leaflet-powered Peshawar map with interactive droplet markers, area clustering, and GPS locate-me |
| 🌐 **Bilingual (English / اردو)** | Complete RTL support with localized Urdu and Pashto area nomenclature |
| 👥 **Civic Proof-of-Work** | Community-driven upvoting and citizen-led resolution verification (`Is this really fixed?`) |
| 🏆 **Accountability Scoreboard** | Data-driven ranking of Peshawar municipal zones by response time and resolution rate |
| 🚨 **Severity Gauge** | Color-coded indicators (`Ankle-Deep`, `Knee-Deep`, `Danger / Open Manhole`) |
| 🗺️ **محفوظ راستہ (Safe Route)** | AI Safe-Route & Manhole Avoidance Navigator routing commuters around flood choke points with Gemini safety advisories |
| 📨 **Automated WSSP Dispatch** | Real-time email dispatch integration with Water & Sanitation Services Peshawar |
| 🔐 **RBAC Security** | Next-Auth v5 role-based access control separating citizen reporters from municipal dispatchers |

---

## 🏗️ System Architecture

```mermaid
graph TD
    A[Citizen Camera / Upload] -->|Photo + GPS| B[Next.js Client Application]
    B -->|Multimodal Payload| C[API: /api/analyze]
    C -->|Image Buffer + Prompt| D[Google Gemini 1.5 Flash]
    D -->|Classification + Severity + Urdu/EN Text| C
    C -->|Triage Metadata| B
    B -->|Confirmed Submission| E[API: /api/reports]
    E -->|Store Report| F[(PostgreSQL via Drizzle ORM)]
    E -->|If Danger / High Severity| G[API: /api/wssp-notify]
    G -->|SMTP Dispatch| H[WSSP Municipal Complaint Cell]
    F -->|Live Geospatial Stream| I[Interactive Leaflet Map]
    F -->|Resolution Metrics| J[Civic Performance Scoreboard]
    K[Community Citizens] -->|Confirmations & Fix Verifications| F
```

---

## 💻 Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **AI / Multimodal Engine**: [Google Gemini 1.5 Flash](https://ai.google.dev/) via `@google/generative-ai`
- **Database**: [PostgreSQL](https://www.postgresql.org/) (compatible with Neon Serverless Postgres & Local PG)
- **ORM & Migrations**: [Drizzle ORM](https://orm.drizzle.team/) & [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview)
- **Authentication**: [Auth.js / NextAuth.js v5 beta](https://authjs.dev/) with PostgreSQL Adapter & Credentials Provider
- **Mapping & GIS**: [Leaflet](https://leafletjs.com/) with custom SVG SVG pins
- **Icons & Visuals**: [Lucide React](https://lucide.dev/)
- **Analytics & Charts**: [Recharts](https://recharts.org/)
- **Email Notifications**: [Nodemailer](https://nodemailer.com/)

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js**: `v20.x` or higher
- **PostgreSQL**: Local instance or cloud database (e.g. Neon, Supabase)
- **Google Gemini API Key**: Free key from [Google AI Studio](https://aistudio.google.com/)

### 2. Clone the Repository
```bash
git clone https://github.com/Anas-Khannn/gdg_buildathon_hackhathon.git
cd gdg_buildathon_hackhathon
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env.local` and configure your credentials:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/naali_watch
AUTH_SECRET=generate_with_openssl_rand_base64_32
AUTH_TRUST_HOST=true
NEXTAUTH_URL=http://localhost:3000

# Google Gemini API Key for Vision Analysis
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: WSSP Email Notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
WSSP_EMAIL=wssp.complaints.peshawar@gmail.com
```

---

## 🗄️ Database & Seed Data

NaaliWatch comes with a comprehensive seed script that populates realistic Peshawar administrative zones, sample verified reports, upvotes, and municipal test accounts.

### 1. Push Database Schema
```bash
npm run db:push
```

### 2. Seed Peshawar Data
```bash
npm run db:seed
```

> **Default Seed Accounts:**
> - **Citizen User**: `citizen@naaliwatch.pk` | Password: `password123`
> - **Municipal Admin**: `admin@wssp.peshawar.gov.pk` | Password: `adminpassword123`

### 3. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗺️ Project Structure

```
gdg_buildathon/
├── docs/
│   ├── DESIGN_Naali_Watch.docx      # Design specifications
│   ├── PRD_Naali_Watch.docx         # Product requirements document
│   └── screenshots/                 # High-resolution showcase assets
├── public/                          # Static assets & public icons
├── src/
│   ├── app/
│   │   ├── about/                   # About page & civic mission
│   │   ├── admin/                   # Municipal triage & dispatch portal
│   │   ├── api/
│   │   │   ├── admin/               # Administrative status updates
│   │   │   ├── analyze/             # Google Gemini Vision multimodal analysis
│   │   │   ├── auth/                # NextAuth route handlers & password reset
│   │   │   ├── geocode/             # Reverse geocoding for Peshawar locations
│   │   │   ├── photos/              # Secure photo serving endpoint
│   │   │   ├── reports/             # Report creation, listing, & upvotes
│   │   │   ├── scoreboard/          # Zone-wise metrics aggregation
│   │   │   └── wssp-notify/         # Automated WSSP dispatch alerts
│   │   ├── auth/                    # Sign in, register, forgot password
│   │   ├── scoreboard/              # Public Peshawar civic leaderboard
│   │   ├── globals.css              # Custom styling & animations
│   │   ├── layout.tsx               # Root layout with providers
│   │   └── page.tsx                 # Dynamic citizen dashboard
│   ├── components/
│   │   ├── auth/                    # Authentication modals & forms
│   │   ├── droplet-pin.tsx          # Animated SVG urgency droplet pins
│   │   ├── header.tsx               # Navigation header & language switch
│   │   ├── home-page-client.tsx     # Client-side map & reports interactive UI
│   │   ├── language-provider.tsx    # English / Urdu RTL state provider
│   │   ├── map/                     # Leaflet map container & markers
│   │   ├── report-detail-drawer.tsx # Slide-over inspection drawer
│   │   ├── report-modal.tsx         # Camera capture & Gemini upload modal
│   │   └── staff-gauge.tsx          # Water depth visualization gauge
│   ├── db/
│   │   ├── index.ts                 # Drizzle database client
│   │   ├── schema.ts                # PostgreSQL schema definitions
│   │   └── seed.ts                  # Peshawar seed dataset
│   ├── lib/
│   │   └── i18n.ts                  # English and Urdu translation dictionary
│   ├── types/
│   │   └── report.ts                # TypeScript interfaces
│   └── auth.ts                      # NextAuth configuration
├── uploads/                         # Stored report photographs & placeholders
├── .env.example                     # Environment configuration template
├── drizzle.config.ts                # Drizzle ORM configuration
├── next.config.ts                   # Next.js 15 configuration
├── package.json                     # Project manifest & scripts
└── tsconfig.json                    # TypeScript compiler configuration
```

---

## 🔮 Future Roadmap

- [ ] **WhatsApp & SMS Bot Integration**: Enable reporting for offline or feature-phone users via Twilio WhatsApp API.
- [ ] **IoT Drain Water-Level Sensors**: Connect ESP32 water level sensors along Ring Road and Hayatabad nullahs for early monsoon flood warnings.
- [ ] **Predictive Flood Modeling**: Train historical weather models against past monsoon choke points to pre-deploy WSSP de-watering pumps.
- [ ] **Decentralized Civic Bounties**: Reward active community certifiers with municipal utility discounts or local green badges.

---

## 👥 Contributors & GDG Buildathon Team

- **Lead Developer**: [Anas Khan](https://github.com/Anas-Khannn)
- **Hackathon**: Google Developer Groups (GDG) Buildathon 2026
- **Target City**: Peshawar, Khyber Pakhtunkhwa, Pakistan

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — open-source civic tech built for the public good.
