# 🏋️ Gym Management System – Full Modular Architecture Spec

This document details the architectural specification for the Maximus Fitness platform, organized by system module. It serves as a tracking guide for what is currently built, what is partially integrated, and what needs to be constructed.

---

## 🎯 Architecture Overview

The system runs on a **Turborepo monorepo** using NPM workspaces:

```
maximus-fitness/
├── apps/
│   ├── website/        # Next.js Public Marketing Website (Fully Built with WebGL Shaders & Testimonials)
│   ├── admin/          # Next.js Admin, Trainer, & Receptionist Portal (Fully Built & API Integrated)
│   ├── member/         # Next.js Member Portal (Fully Built & API Integrated)
│   └── api/            # NestJS Backend API (Core Controllers, JWT verification, Supabase integration)
├── packages/
│   ├── ui/             # Shared Tailwind/ShadCN UI components (Built)
│   ├── database/       # Shared Prisma ORM Client & Migrations (Built & pushed to Supabase)
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
* **Status**: `[FULLY COMPLETED]`
* **Supabase Integration**: Direct Supabase Auth client & JWT token verification implemented on the backend via `SupabaseAuthGuard` and on the frontend via `AuthContext` using browser session tokens.
* **Prisma Schema**: `User` and `Profile` tables mapped with Supabase UUIDs. Local database profile is auto-provisioned/synchronized on the first successful login of any user.
* **Features Built**:
  - Email & password signup and login, forgot password (email reset link generation), and reset password forms.
  - Google OAuth authentication flow fully integrated (client credentials, matching callback, Google JavaScript origins configured).
  - Full role-based access redirection. Prevents `MEMBER` users from landing on the Admin portal (`localhost:3001`), and vice versa (redirects `ADMIN` and `SUPER_ADMIN` away from the Member portal (`localhost:3002`)).
  - Super Admin seeding script `scripts/create-super-admin.js` implemented to easily deploy a `SUPER_ADMIN` user with bypassed email confirmation directly.
  - Role decorators (`@Roles()`) and Guards (`RolesGuard`, `SupabaseAuthGuard`) protecting APIs.

### Module 2: Dashboard
* **Status**: `[FULLY COMPLETED]`
* **Admin Dashboard** (`apps/admin`):
  - Collapsible, styled sidebar navigation with active route highlighting, user profile status, and sign-out function.
  - 8 Key Stat Cards showing Today's Attendance, Total Members, Active Memberships, Expiring Soon (7-day window), Today's Revenue, Monthly Revenue (with comparison to last month), PT Clients, and Today's Classes.
  - Recharts Area Chart for Monthly Revenue vs Target (with HSL-tailored gradient coloring).
  - Recharts Pie Chart for Gender Ratio.
  - Recharts Bar Chart for Weekly Attendance.
  - Recharts Line Chart for Membership Growth.
  - Recent Members data table with status badges (ACTIVE, FROZEN, TRIAL).
  - Upcoming renewals countdown widget.
  - Interactive today's classes grid with slot fill-rate meters.
* **Member Dashboard** (`apps/member`):
  - Collapsible, member-specific sidebar navigation.
  - Day Streak tracker badge.
  - Stat cards for workout streaks, calories burned today, interactive daily hydration cups logging, current weight, remaining active membership days, and PT sessions balance.
  - Today's workout checklist panel with exercise check-off state management.
  - Macro intake progress bar widgets (Protein, Carbs, Fats targets).
  - Weight Progress area chart.
  - Weekly workout frequency bar chart.
  - Recent attendance history feed.
* **Backend**: `UsersController` features a `:id/dashboard` route returning mock database associations.

### Module 3: Member Management
* **Status**: `[FULLY COMPLETED]`
* **Admin Portal Integrations**:
  - Connected to `/users` and `/users/:id` API endpoints on NestJS.
  - Super Admins and Admins can view a complete directory of gym members.
  - Supports member profile updates (name, phone, emergency contact, DOB, gender, height, weight, BMI, goals, medical history) and status modifications (ACTIVE, FROZEN, SUSPENDED).
  - Allows assigning and transferring members between different Gym tenants (multi-tenant support).
  - Allows creating/registering new members through the admin panel (triggers backend user creation via Supabase SDK).
* **Features To Build**: Support avatar image uploads to Supabase Storage.

### Module 4: Membership Management
* **Status**: `[FULLY COMPLETED]`
* **Admin Portal Integrations**:
  - Full integration with `/memberships` and `/memberships/plans` backend endpoints.
  - Admin/Super Admin can create, read, update, and manage pricing/membership plans (duration days, description, price, gym owner).
  - Admin can assign a plan to any member, specifying start dates (auto-calculates end date based on duration).
  - Allows updating status of membership records (ACTIVE, EXPIRED, FROZEN, CANCELLED) and renewing expired/expiring packages.
  - Displays metrics for active vs expiring memberships and logs invoices.
* **Member Portal Integrations**:
  - Retrieves current active membership, historical plans list, and corresponding invoices from the backend `/memberships/my` and `/memberships/my/invoices` endpoints.
* **Backend API**: `MembershipsService` is fully functional with logic for plan CRUD, assignments, status tracking, renewals, invoice fetching, and revenue aggregation.

### Module 5: Attendance
* **Status**: `[FULLY COMPLETED]`
* **Admin Portal Integrations**:
  - Interactive monthly calendar attendance grid.
  - Receptionists, Admins, and Super Admins can search members and toggle attendance status (Check In/Out) for any user on any day (calls `POST /attendance/mark` and `DELETE /attendance/unmark`).
* **Member Portal Integrations**:
  - Visual 12-month calendar map representing daily check-ins (GitHub-commit style grid).
  - Displays total present days, overall attendance rate, current month attendance, and active check-in streak.
  - Hitting `/attendance/checkin` lets member check themselves in.
* **Backend API**: `AttendanceService` handles duplicate checking, idempotent marking/unmarking, monthly gym-wide reports, and 12-month member logs.
* **Features To Build**: QR code generator service for members (QR matches user ID), scanner scanner utility for Receptionists, and Peak Hours calculations.

### Module 6: Trainer Management
* **Status**: `[DATA LAYER & FRONTEND MOCKS ACTIVE]`
* **Prisma Schema**: `Trainer` table storing specialties, bio, rating, salary, and ptEarnings.
* **Features To Build**: Trainer onboarding interface, ratings system, assigned client directory.

### Module 7: Personal Training
* **Status**: `[DATA LAYER & FRONTEND MOCKS ACTIVE]`
* **Prisma Schema**: Relational tables (`TrainerToMember`, `UserToTrainer`, `PTSession`, `PersonalTrainingPackage`) defined.
* **Features To Build**: 1-on-1 package builder, PT booking calendar, workout notes logger.

### Module 8: Workout Management
* **Status**: `[FULLY INTEGRATED]`
* **Prisma Schema**: `WorkoutPlan`, `WorkoutExercise`, `WorkoutSession`, `WorkoutSessionExercise`, and `Exercise` tables.
* **Admin Portal**: Fully functional **Exercise Library Manager** that integrates with the backend `/exercises` REST endpoints to perform complete CRUD operations. Supports muscle group taxonomy (`Category|Subcategory`), difficulties, instructions, and video URLs.
* **Member Portal**: Interactive **Exercise Library Browser** where members can search, filter by category or difficulty, and inspect instructional guides/videos.
* **Backend API**: `WorkoutsService` handles creating workout plans, fetching plans based on goal type, logging workout sessions, and fetching user workout session histories.
* **Features To Build**: Member portal interface to select and assign a structured `WorkoutPlan` to follow over time, tracking set weights, reps, and RPE progress dynamically.

### Module 9: Diet Management
* **Status**: `[DATA LAYER & BACKEND SERVICE ACTIVE]`
* **Prisma Schema**: `DietPlan` and `DietMeal` (calories, protein, fats, carbs) tables.
* **Backend API**: `DietsService` allows creating diet plans (with multiple meals and caloric macros) and fetching plans based on fitness goals.
* **Features To Build**: Frontend diet planner interfaces for trainers/nutritionists and progress checklist widgets for members.

### Module 10: Body Measurements
* **Status**: `[FULLY INTEGRATED]`
* **Prisma Schema**: `Measurement` table storing weight, body fat %, BMI, chest, waist, hip, arms, shoulders, recordedAt.
* **Features Built**: Settings page in Member portal allows inputting and saving body weight, height, BMI, goal type, and medical history.
* **Features To Build**: Body measurement progress log inputs, date-wise history tables, and graphical trend tracking.

### Module 11: Progress Tracking
* **Status**: `[PARTIAL BUILD - FRONTEND CHARTS]`
* **Prisma Schema**: `ProgressPhoto` table mapped to member profiles.
* **Features Built**: Weight Area Chart on member portal.
* **Features To Build**: Comparison slider for progress photos, PR history graphs, badge achievement milestones.

### Module 12: Class Management
* **Status**: `[DATA LAYER ONLY]`
* **Prisma Schema**: `Class` and `ClassBooking` tables.
* **Features To Build**: Class booking system for members, class schedule tables, instructor assignment interface.

### Module 13: Payments / Billing
* **Status**: `[FULLY INTEGRATED]`
* **Prisma Schema**: `Invoice` and `Payment` tables with methods (UPI, Cash, Card) and statuses.
* **Features Built**:
  - Assigning memberships automatically generates invoices and logs corresponding invoice entries in the DB.
  - Member portal displays an Invoices tab listing billing dates, transaction numbers, base/tax amounts, status, and payment details.
  - Admin portal features a **Revenue** panel showing monthly revenue timelines, billing history, payment methods, and invoice statuses.
* **Features To Build**: GST configuration, PDF invoice printing, automated reminder notifications.

### Module 14: Leads CRM
* **Status**: `[FULLY INTEGRATED]`
* **Prisma Schema**: `Lead` table (name, email, phone, source, status, notes).
* **Backend API**: `LeadsController` and `LeadsService` support lead submission (available anonymously) and retrieval of active leads.
* **Frontends**: Public marketing website's contact forms submit leads to backend API. Admin portal shows leads directory.

### Module 15: Notifications
* **Status**: `[DATA LAYER ONLY]`
* **Prisma Schema**: `Notification` table tracking type (SMS, EMAIL, PUSH, WHATSAPP) and delivery status.
* **Features To Build**: Trigger notification hooks for membership expiry, birthdays, and payment reminders.

### Module 16: Reports
* **Status**: `[PARTIAL BUILD - FRONTEND MOCKS ACTIVE]`
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
* **Status**: `[FULLY INTEGRATED]`
* **Prisma Schema**: `Setting` table.
* **Features Built**: Member and Admin settings pages fully operational. Supports editing name, phone, gender, dob, emergency contact, height, weight, goal, and medical history. Password tab connects to Supabase auth client, letting users update their current password.

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
