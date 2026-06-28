# 🏋️ Gym Management System – Full Modular Architecture Spec

This document details the architectural specification for the Maximus Fitness platform, organized by system module. It serves as a tracking guide for what is currently built, what is partially integrated, and what needs to be constructed.

---

## 🎯 Architecture Overview

The system runs on a **Turborepo monorepo** using NPM workspaces:

```
maximus-fitness/
├── apps/
│   ├── website/        # Next.js Public Marketing Website (Built)
│   ├── admin/          # Next.js Admin, Trainer, & Receptionist Portal (Built - Mock Dashboard)
│   ├── member/         # Next.js Member Portal (Built - Mock Dashboard)
│   └── api/            # NestJS Backend API (Partial Build - Core Controllers)
├── packages/
│   ├── ui/             # Shared Tailwind/ShadCN UI components (Built)
│   ├── database/       # Shared Prisma ORM Client & Migrations (Built)
│   ├── types/          # Shared DTOs and TypeScript Interface Contracts (Built)
│   └── utils/          # Formatting & Math Helpers (Built)
```

---

## 👥 Multi-Role Permission Model

The system utilizes a central role hierarchy to dictate access to backend routes and frontend dashboards. All roles login through the same portal and are routed accordingly.

* **SUPER_ADMIN**: Complete system access, SaaS management, and Gym tenant creation.
* **ADMIN**: Core manager of a specific Gym tenant. Full access to members, memberships, and billing.
* **RECEPTIONIST**: Access to member listings, attendance scanners, check-ins, and lead management.
* **TRAINER**: Access to assigned workout plans, class scheduling, and member progress.
* **PERSONAL_TRAINER**: Access to dedicated 1-on-1 PT client logs, calendars, and nutrition planning.
* **NUTRITIONIST**: Access to diet plan generation, food logs, and water intake histories.
* **MEMBER**: Access to start workouts, log weights, view personal statistics, and track attendance.

---

## 📦 System Modules Spec & Status

Here is the tracking status of the 25 system modules:

### Module 1: Authentication
* **Status**: `[PARTIAL BUILD - AUTH GUARD & USER AUTO-PROFILING ACTIVE]`
* **Supabase Integration**: Direct Supabase Auth JWT token verification implemented on the backend via `SupabaseAuthGuard`.
* **Prisma Schema**: `User` and `Profile` tables mapped withsupbase UUIDs. Auto-creates local profiles upon first successful login if mismatch occurs.
* **Features Built**: Local token validation, user/gym context payload injection on requests, role-based guard decorator (`@Roles()`).
* **Features To Build**: Google OAuth flow, OTP verification handlers, session expiration logging.

### Module 2: Dashboard
* **Status**: `[PARTIAL BUILD - FRONTEND MOCKS ACTIVE]`
* **Frontends**:
  - `apps/admin`: Pre-built cards showing today's check-ins, total members, revenue stats, and Recharts line timeline.
  - `apps/member`: Pre-built streak flame trackers, hydration trackers, unlocked badges, and Recharts Area charts.
* **Backend**: `UsersController` features a `:id/dashboard` route returning mock database associations.
* **Features To Build**: Aggregate database statistics (Active vs Expiring plans, peak hour calculations, gender ratio charts).

### Module 3: Member Management
* **Status**: `[PARTIAL BUILD - SCHEMA & MOCK TABLE IMPLEMENTED]`
* **Prisma Schema**: `Profile` table contains height, weight, BMI, goals, gender, dob, emergency contact, medical history.
* **Features Built**: Add member form on admin portal (inserts local React state), freeze member action, and detail grids.
* **Features To Build**: Connect frontend Forms to the NestJS `/users` and `/users/:id` REST endpoints. Support avatar image uploads to Supabase Storage.

### Module 4: Membership Management
* **Status**: `[PARTIAL BUILD - DATA SCHEMA IMPLEMENTED]`
* **Prisma Schema**: `MembershipPlan` (prices, durations) and `Membership` (start, end, freeze dates, status) tables defined.
* **Features Built**: Active/Frozen status tag indicators on frontend tables.
* **Features To Build**: Renew, upgrade, freeze, cancel, and transfer transaction API services on NestJS. Plan code generators.

### Module 5: Attendance
* **Status**: `[PARTIAL BUILD - CHECK-IN ENDPOINT OPERATIONAL]`
* **Prisma Schema**: `Attendance` table with composite unique index `[userId, date]` ensuring one entry per user per day.
* **Features Built**: Check-in controller endpoint (`POST /attendance/checkin`) that checks for duplicates. Recent check-in feed lists.
* **Features To Build**: QR code generator service for members (QR matches user ID), scan scanner utility for Receptionists, and Peak Hours calculations.

### Module 6: Trainer Management
* **Status**: `[DATA LAYER ONLY]`
* **Prisma Schema**: `Trainer` table storing specialties, bio, rating, salary, and ptEarnings.
* **Features To Build**: Trainer onboarding interface, ratings system, assigned client directory.

### Module 7: Personal Training
* **Status**: `[DATA LAYER ONLY]`
* **Prisma Schema**: `Trainer` and `User` relational mapping (`TrainerToMember` / `UserToTrainer`).
* **Features To Build**: 1-on-1 package builder, PT booking calendar, workout notes logger.

### Module 8: Workout Management
* **Status**: `[PARTIAL BUILD - LOCAL WORKOUT LOGS]`
* **Prisma Schema**: `WorkoutPlan`, `WorkoutExercise`, `WorkoutSession`, `WorkoutSessionExercise`, and `Exercise` tables.
* **Features Built**: Member portal "Start Workout" view allows checking off sets and logs count parameters.
* **Features To Build**: Global exercise library builder (Admin), muscle group classification tags, instructions, and video URLs.

### Module 9: Diet Management
* **Status**: `[DATA LAYER ONLY]`
* **Prisma Schema**: `DietPlan` and `DietMeal` (calories, protein, fats, carbs) tables.
* **Features To Build**: Diet builder interface, caloric macro calculator, and PDF menu export service.

### Module 10: Body Measurements
* **Status**: `[DATA LAYER ONLY]`
* **Prisma Schema**: `Measurement` table storing weight, body fat %, BMI, chest, waist, hip, arms, shoulders, recordedAt.
* **Features To Build**: Measurement log inputs, date-wise history tables, and graphical trend tracking.

### Module 11: Progress Tracking
* **Status**: `[PARTIAL BUILD - FRONTEND CHARTS]`
* **Prisma Schema**: `ProgressPhoto` table mapped to member profiles.
* **Features Built**: Weight Area Chart on member portal.
* **Features To Build**: Comparison slider for progress photos, PR history graphs, badge achievement milestones.

### Module 12: Class Management
* **Status**: `[DATA LAYER ONLY]`
* **Prisma Schema**: `Class` and `ClassBooking` tables.
* **Features To Build**: Class booking system for members, class schedule tables, instructor assignment interface.

### Module 13: Payments
* **Status**: `[DATA LAYER ONLY]`
* **Prisma Schema**: `Invoice` and `Payment` tables with methods (UPI, Cash, Card) and statuses.
* **Features To Build**: Invoice auto-generation, GST addition, invoice printing, email reminders for dues.

### Module 14: Leads CRM
* **Status**: `[PARTIAL BUILD - READ OPERATIONS MAPPED]`
* **Prisma Schema**: `Lead` table (name, email, phone, source, status, notes).
* **Backend**: `LeadsController` and `LeadsService` implement read-only feeds.
* **Features To Build**: Leads capture webhook connecting website "Contact Us" terminal straight to database, status updates (Interested -> Joined).

### Module 15: Notifications
* **Status**: `[DATA LAYER ONLY]`
* **Prisma Schema**: `Notification` table tracking type (SMS, EMAIL, PUSH, WHATSAPP) and delivery status.
* **Features To Build**: Trigger notification hooks for membership expiry, birthdays, and payment reminders.

### Module 16: Reports
* **Status**: `[PENDING]`
* **Features To Build**: Query aggregations to download attendance sheets, payment summaries, and revenue logs in PDF, Excel, or CSV format.

### Module 17: Expense Management
* **Status**: `[DATA LAYER ONLY]`
* **Prisma Schema**: `Expense` table with categorizations (Salary, Rent, Maintenance).
* **Features To Build**: Expense logger panel, net profit graphs.

### Module 18: Inventory
* **Status**: `[DATA LAYER ONLY]`
* **Prisma Schema**: `InventoryItem` table.
* **Features To Build**: Merchandise & supplements stock tracker, low stock alert system.

### Module 19: Gallery Management
* **Status**: `[PENDING]`
* **Features To Build**: Transformation images upload widget, homepage gallery dynamic updates.

### Module 20: CMS
* **Status**: `[PENDING]`
* **Features To Build**: Admin panel inputs to update homepage sliders, trainer lists, testimonials, and FAQs.

### Module 21: Settings
* **Status**: `[DATA LAYER ONLY]`
* **Prisma Schema**: `Setting` table.
* **Features To Build**: Gym hours updater, tax percentage configuration, currency options.

### Module 22: Analytics
* **Status**: `[PENDING]`
* **Features To Build**: Heatmaps of peak times, member conversion ratios, trainer performance scorecards.

### Module 23: AI Module
* **Status**: `[PENDING]`
* **Features To Build**: Integration wrappers for workout/diet plan generation, prediction modules.

### Module 24: Mobile Features
* **Status**: `[PARTIAL BUILD]`
* **Features Built**: Responsive web templates.
* **Features To Build**: QR check-in display component, push notification handlers.

### Module 25: Future Integrations
* **Status**: `[PENDING]`
* **Features To Build**: razorpay/stripe setups, WhatsApp business APIs, health SDK synchronizations.

---

## 🗄️ Database Schema Tables Mapping

Our database schema defined in `schema.prisma` aligns directly with the modular specifications:

1. `Gym` (Multi-tenant settings)
2. `User` (Credential roles)
3. `Profile` (Physical specs & details)
4. `Trainer` (Specialties & salary)
5. `MembershipPlan` (Price rules)
6. `Membership` (Active status intervals)
7. `Attendance` (Checkin dates)
8. `Class` (Group sessions)
9. `ClassBooking` (Member allocations)
10. `Exercise` (Movement library)
11. `WorkoutPlan` (Preset blueprints)
12. `WorkoutExercise` (Blueprint moves)
13. `WorkoutSession` (Client logs)
14. `WorkoutSessionExercise` (Set details logged)
15. `PR` (Personal achievements)
16. `DietPlan` (Nutrition schedules)
17. `DietMeal` (Caloric macros)
18. `Measurement` (Weight, body measurements)
19. `ProgressPhoto` (Image histories)
20. `Invoice` (Billing details)
21. `Payment` (Transaction states)
22. `Expense` (Bills & salary logs)
23. `InventoryItem` (Stocks)
24. `Lead` (Inbound CRM details)
25. `Notification` (Status updates logs)
26. `AuditLog` (Security tracks)
27. `Setting` (App configuration keys)
