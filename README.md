# Clinical Laboratory Sample Tracking and Result Delivery Management System

A production-inspired, enterprise-grade full-stack diagnostic laboratory web application built to streamline secure sample tracking, laboratory operations, intelligent result entry, pathologist verification, and patient report delivery.

---

## 🌟 Key System Features

- **5 Distinct Application Roles**: `Administrator`, `Laboratory Technician`, `Doctor` (Consulting Pathologist), `Receptionist`, and `Patient`.
- **10-Step Sample Life-Cycle & State Machine**: `REGISTERED` → `COLLECTED` → `RECEIVED` → `QUALITY_CHECK` → `ASSIGNED` → `IN_ANALYSIS` → `QUALITY_VERIFICATION` → `RESULT_GENERATED` → `DOCTOR_VERIFICATION` → `RELEASED` → `DELIVERED` with `REJECTED` and `RETEST_REQUESTED` branches.
- **Dynamic Result Entry & Reference Interval Engine**: Automatically flags numerical and qualitative findings as `NORMAL`, `ABNORMAL_HIGH`, `ABNORMAL_LOW`, or `CRITICAL`.
- **Intelligent Non-Diagnostic Clinical Decision Support**: Rule-based observations detailing parameter variations relative to reference ranges with explicit medical disclaimers.
- **Cryptographic Report QR Verification**: Embedded QR codes on PDF reports pointing to `/verify-report/:reportId` for public authenticity validation without exposing private PII.
- **Official PDF Report Generator**: Streamable laboratory reports featuring Lab Header, Patient Metadata, Parameter Results Table, Flag Badges, and Pathologist Digital Signature.
- **Immutable Audit Trail & Chain of Custody**: Complete forensic activity logging tracking timestamps, responsible staff, location, and payload diffs.
- **Interactive Analytics**: Recharts area charts for monthly sample growth, status distribution donuts, and technician workload telemetry.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18, TypeScript, Vite
- **Styling & UI**: Tailwind CSS, Framer Motion, Glassmorphism design system, Dark Mode support
- **State & Routing**: React Router v6, TanStack React Query, React Hook Form, Zod
- **Icons & Data Viz**: Lucide React, Recharts, QRCode.SVG, Canvas Confetti

### Backend
- **Runtime**: Node.js, Express.js, TypeScript
- **Database & Storage**: MongoDB with Mongoose, Local/Cloudinary Storage Abstraction
- **Security & Validation**: JWT Access & Refresh Tokens, bcryptjs, Zod, Helmet, CORS, Express Rate Limit
- **Logging & Utilities**: Winston, Morgan, PDFKit

---

## 🔑 Demo Access Credentials

The application login screen includes **One-Click Quick Role Switcher Buttons** for instant evaluation of all 5 perspectives:

| Role | Email / Identifier | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@clinicallab.com` | `password123` | System telemetry, user management, audit logs, test catalog |
| **Laboratory Technician** | `tech@clinicallab.com` | `password123` | Workload queue, 10-step status advancing, result entry, QC checks |
| **Doctor (Pathologist)** | `doctor@clinicallab.com` | `password123` | Verification queue, clinical notes, report release controls |
| **Receptionist** | `reception@clinicallab.com` | `password123` | Patient intake, sample registration, QR & barcode label generation |
| **Patient (Demo)** | `patient@clinicallab.com` | `password123` | Digital Health Pass ID card, report view, PDF download, live tracking |
| **Patient (Registered)** | `himashree@gmail.com` / `PAT-2026-000002` | `password123` | Registered Patient portal, report view, sample status tracking |

---

## 📁 Repository Structure

```
clinical_laboratory_management/
├── server/
│   ├── src/
│   │   ├── config/ (db.ts, logger.ts, constants.ts)
│   │   ├── controllers/ (auth, sample, result, patient, admin, analytics, publicVerification)
│   │   ├── middleware/ (auth, rbac, rateLimiter, validate, errorHandler)
│   │   ├── models/ (User, Patient, TestCatalog, Sample, Result, AuditLog, Notification)
│   │   ├── routes/ (auth, sample, result, patient, admin, analytics, notification, publicVerification)
│   │   ├── services/ (clinicalInsights, pdfService, qrService, dataStore)
│   │   ├── utils/ (stateMachine, rangeEvaluator, seedData)
│   │   ├── validators/ (zodSchemas)
│   │   ├── app.ts
│   │   └── server.ts
│   └── tests/ (auth.test.ts, sampleWorkflow.test.ts)
├── client/
│   ├── src/
│   │   ├── components/ (common, dashboard, samples, results, landing)
│   │   ├── context/ (AuthContext, ThemeContext, NotificationContext)
│   │   ├── pages/ (LandingPage, LoginPage, DashboardPage, SamplesPage, SampleDetailPage, ResultEntryPage, ReportPage, PatientsPage, AuditLogsPage, PublicReportVerificationPage)
│   │   ├── services/ (api, csvExport)
│   │   ├── types/ (index.ts)
│   │   ├── utils/ (rangeEvaluator)
│   │   ├── App.tsx
│   │   └── main.tsx
└── README.md
```

---

## ⚡ Quick Start & Installation

### 1. Clone & Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in both `server` and `client` directories.

### 3. Run Development Servers

**Option A (Single Command from Root):**
```bash
npm run dev
# Or on Windows, double-click start.bat
```

**Option B (Separate Terminals):**
```bash
# Terminal 1: Start backend API (Port 5000)
cd server
npm run dev

# Terminal 2: Start frontend application (Port 5173)
cd client
npm run dev
```

Visit **http://localhost:5173/** in your browser.

---

## 🧪 Testing

Execute backend automated integration and unit tests:

```bash
cd server
npm test
```

---

## ⚖️ Important Medical Safety Disclaimer

This software is designed for laboratory workflow optimization and diagnostic result management. It does **NOT** provide medical diagnoses or treatment recommendations. All automated reference range flags and clinical observations are informational only and must be interpreted by a qualified licensed medical practitioner.
