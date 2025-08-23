# MediMitra

MediMitra is a comprehensive healthcare web application built. It provides hospitals, patients, and doctors with advanced tools for digital medical records, appointment management, AI-powered chat, a robust helpdesk, and detailed hospital administration—all on a modern, scalable architecture.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
  - [Patient Portal](#patient-portal-features)
  - [Doctor Portal](#doctor-portal-features)
  - [Hospital Admin Portal](#hospital-admin-features)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Setup and Installation](#setup-and-installation)
- [AI Chatbot Integration](#ai-chatbot-integration)
- [Authentication and Email Workflows](#authentication-and-email-workflows)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## Overview

MediMitra bridges the gap between patients, doctors, and hospital administrators by offering:

- Role-based logins for patients, doctors, and hospital admins
- Secure, centralized management of medical records and health data
- Smart appointment booking, scheduling, and hospital-side management
- AI-powered chatbot for patients, with urgency scoring, doctor assignment, and disease interpretation
- Patient helpdesk and ticket tracking for support queries
- Private folders for patient reports and upcoming AI-powered analysis
- Hospital-facing management of beds, doctors, and appointments
- Rich user profiles with map/location integration
- Health score and reminders to foster proactive health updates

---

## Features

### Patient Portal Features

- **Role-Based Login:** Email/password or Google OAuth. 
- **AI-Powered Chatbot:** 
  - Built with LangGraph and MongoDB.
  - Assigns urgency scores to queries, fetches suitable doctors from the database, and interprets diseases for better advice.
  - Supports (coming soon) multiple regional languages via VAPI.
  - Will use uploaded reports for personalized conversations.
- **Appointment Booking:** Book and manage appointments via chatbot or dashboard.
- **Helpdesk & Ticket Tracking:** Raise and track support queries.
- **Private Report Folder:** Secure upload/view of medical reports.
- **Upcoming: AI Report Analysis:** Uploaded reports will soon be analyzed by AI for deeper health insights.
- **Health Score:** Calculated from profile completeness and regular updates (BP, weight, etc); weekly reminders.
- **Weekly Reminders:** Automated emails (NodeMailer) prompt users to update health details.

### Doctor Portal Features

- **Manage Appointments:** View, accept, or decline patient appointments.
- **View Patient Reports:** Access documents with patient permission.
- **Respond to Helpdesk Tickets:** Address patient queries.
- **Detailed Profile:** Maintain a professional profile.

### Hospital Admin Features

- **Overview Dashboard:** High-level summary of hospital resources and activities.
- **Bed Management:** 
  - Per-floor bed tracking: available, booked, under maintenance, and cleaning status.
- **Appointment Scheduler Management:** 
  - View, verify, update, or cancel appointments. 
- **Doctor Management:** 
  - Add and verify doctors (doctor-side verification coming soon).
- **Detailed Hospital Profile:** 
  - Maintain hospital info, including address, maps, and more.

---

## Project Structure

> This reflects the actual layout from the GitHub repository.

```plaintext
MediMitra/
├── .vscode/
│   └── settings.json
├── agent/
│   ├── __pycache__/
│   │   ├── api.cpython-313.pyc
│   │   ├── booking.cpython-313.pyc
│   │   ├── bot.cpython-313.pyc
│   │   └── gemini_embedding.cpython-313.pyc
│   ├── .env.example
│   ├── .gitignore
│   ├── api.py
│   ├── booking.py
│   ├── bot.py
│   ├── Dockerfile
│   ├── embedding_model.py
│   ├── gemini_embedding.py
│   └── requirements.txt
├── Backend/
│   ├── .env.example
│   ├── .gitignore
│   ├── common/
│   │   └── common.js
│   ├── control/
│   │   ├── auth.js
│   │   ├── cronjob.js
│   │   └── hopitals.js
│   ├── Dockerfile
│   ├── index.js
│   ├── model/
│   │   ├── auth.js
│   │   ├── hospitalreg.js
│   │   ├── hospitals.js
│   │   └── userweaklytracker.js
│   ├── package.json
│   ├── routes/
│   │   ├── auth.js
│   │   └── hospital.js
│   └── template/
│       ├── emailTemplate.html
│       ├── logo.jpg
│       └── welcomeemail.html
├── client/
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   ├── src/
│   │   ├── App.tsx
│   │   ├── assets/
│   │   │   └── Logo.png
│   │   ├── components/
│   │   │   ├── BedManagementComponent.tsx
│   │   │   ├── FeatureCard.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── LanguageSelector.tsx
│   │   │   ├── QuickActionCard.tsx
│   │   │   ├── Timeago.tsx
│   │   │   └── TypingDotsLoader.tsx
│   │   ├── context/
│   │   │   ├── AuthContext.tsx
│   │   │   └── LanguageContext.tsx
│   │   ├── index.css
│   │   ├── main.tsx
│   │   ├── pages/
│   │   │   ├── AppointmentsPage.tsx
│   │   │   ├── ChatPage.tsx
│   │   │   ├── DashBack
│   │   │   ├── Dashboard.tsx
│   │   │   ├── EmergencyPage.tsx
│   │   │   ├── HelpdeskPage.tsx
│   │   │   ├── HospitalDashboard.tsx
│   │   │   ├── HospitalProfile.tsx
│   │   │   ├── HospitalSignUpPage.tsx
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── MyMedicinesPage.tsx
│   │   │   ├── PasswordResetPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   └── SignupPage.tsx
│   │   ├── translations/
│   │   │   └── translations.json
│   │   ├── types/
│   │   │   ├── hospital.ts
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   └── utils.ts
│   │   └── vite-env.d.ts
│   ├── tailwind.config.js
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── docker-compose.yml
├── LICENSE
└── README.md

```

---

## Technology Stack

- **Frontend:** React.js, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express.js (Backend/ directory)
- **Agent API:** Python (LangGraph, Neo4j, FastAPI style under agent_api/)
- **Authentication:** Passport.js (Local/email, Google OAuth), bcrypt
- **Email:** NodeMailer (SMTP for password reset, welcome emails, weekly reminders)
- **Database:** MongoDB (Mongoose ODM), Neo4j for graph-based logic (via agent_api)
- **AI Chatbot:** LangGraph orchestrator, MongoDB for context, urgency scoring, doctor matching, disease interpretation, regional language support (via VAPI, coming soon)
- **Cloud Hosting:** AWS Elastic Beanstalk, EC2, AWS Load Balancer
- **Version Control:** Git & GitHub

---

## Setup and Installation

### 1. Clone the Repository

```sh
git clone https://github.com/m-s-sat/MediMitra.git
cd MediMitra
```

### 2. Backend Setup

```sh
cd Backend
npm install
cp .env.example .env
# Edit .env for MongoDB URI, JWT secret, Google OAuth, SMTP for NodeMailer, etc.
npm run dev  # For local development
```

### 3. Agent API Setup (AI Chatbot/Neo4j)

```sh
cd agent_api
pip install -r requirements.txt
# Set up your environment variables as needed for Neo4j, etc.
python api.py
```

### 4. Frontend Setup

```sh
cd ..
npm install
npm start
```

---

## AI Chatbot Integration

- **Urgency Scoring:** Scores patient queries to prioritize care.
- **Doctor Assignment:** Fetches suitable doctors from the database based on urgency, specialization, and availability.
- **Disease Interpretation:** Interprets disease context for more accurate chatbot advice.
- **Regional Languages:** Multiple language support (coming soon via VAPI or similar).
- **Contextual Chat:** Remembers user history and will soon use uploaded reports for personalized responses.

---

## Authentication and Email Workflows

- **Email/Password & Google OAuth:** Patients, doctors, and admins see features tailored to their roles.
- **Password Reset:** NodeMailer (SMTP) for secure password recovery.
- **Weekly Reminders:** Automated health detail reminders.
- **Welcome & Credential Emails:** On signup and profile update.

---

## Deployment

- **Backend:** AWS Elastic Beanstalk or EC2, with AWS Load Balancer.
- **Frontend:** Any static hosting (AWS Amplify, Vercel, Netlify).
- **Agent API:** Host as a Python service (EC2, Docker, or any Python-compatible cloud).

---

## Contributing

Contributions are welcome!

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to your fork and open a pull request

For major changes, please open an issue first to discuss your ideas.

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

## Acknowledgements

Special thanks to [Hackathon Name] organizers, mentors, and the open-source communities behind the tools and libraries powering MediMitra.

---