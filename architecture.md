# 🏋️ Gym Management System – Full Architecture Spec (AI Build File)

## 🎯 Objective

Build a full-stack **Gym Management Web Application** with:

* Admin, Trainer, User, Guest roles
* Subscription & user management
* Workout & diet planning
* Progress tracking (charts)
* Leaderboard & PR (Personal Records)
* Goal-based recommendations

---

## 🧱 Tech Stack (STRICT)

### Frontend

* React (Vite)
* Tailwind CSS
* React Router
* Axios

### Backend

* Node.js
* Express.js

### Database & Services

* Supabase

  * PostgreSQL
  * Auth (optional use)
  * Storage (for media)

---

## 🏗️ System Architecture

Client (React) → Node API (Express) → Supabase (PostgreSQL + Storage)

* Frontend handles UI + state
* Backend handles business logic + auth
* Supabase handles DB + storage

---

## 👥 Roles & Permissions

### Roles:

1. ADMIN
2. TRAINER
3. USER (MEMBER)
4. GUEST (no login)

### Access Rules:

* Admin: full access
* Trainer: assigned users only
* User: own data only
* Guest: read-only limited access

---

## 🔐 Authentication

* JWT-based authentication using Node.js
* Store token in frontend (localStorage)
* Middleware for protected routes

---

## 📦 Modules (MANDATORY)

### 1. Auth Module

* POST /auth/register
* POST /auth/login
* JWT generation
* Role-based middleware

---

### 2. User Management (Admin)

* Create user
* Assign trainer
* Set goal:

  * weight_loss
  * muscle_gain
  * strength

---

### 3. Subscription Module

* Create plans (monthly/yearly)
* Assign to users
* Track expiry
* Status: active / expired

---

### 4. Workout Module

* Admin creates workout plans
* Each plan linked to goal
* Contains exercises

---

### 5. Exercise Module

Fields:

* name
* muscle_group
* instructions
* media_url

---

### 6. Progress Module

* Log:

  * weight
  * calories_burned
  * date
* Used for charts

---

### 7. PR (Personal Records)

* Track max weight per exercise
* Status:

  * pending
  * approved
* Approved by trainer/admin

---

### 8. Leaderboard

* Rank users by:

  * attendance
  * PRs
  * consistency

---

### 9. Attendance

* Daily check-in
* One entry per day

---

### 10. Trainer Module

* View assigned users
* Approve PRs
* Update workout

---

### 11. Diet Module (Basic)

* Admin-defined diet plans
* Linked to goals

---

### 12. Guest Module

* No login required
* Can:

  * select goal
  * view sample workout
  * view sample diet

---

## 🗄️ Database Schema (PostgreSQL – Supabase)

### users

* id (uuid, pk)
* name
* email
* password_hash
* role (admin/trainer/user)
* trainer_id (fk)
* goal
* created_at

---

### subscriptions

* id
* user_id
* plan_type
* start_date
* end_date
* status

---

### workouts

* id
* name
* goal_type

---

### exercises

* id
* name
* muscle_group
* description
* media_url

---

### workout_exercises

* id
* workout_id
* exercise_id
* sets
* reps

---

### progress_logs

* id
* user_id
* weight
* calories_burned
* date

---

### prs

* id
* user_id
* exercise_id
* max_weight
* status
* approved_by

---

### attendance

* id
* user_id
* date
* check_in_time

---

### leaderboard

* id
* user_id
* score
* rank

---

## 🔄 API Structure

Base URL: /api

### Auth

* POST /auth/register
* POST /auth/login

### Users

* GET /users
* POST /users
* PUT /users/:id

### Workouts

* GET /workouts
* POST /workouts

### Exercises

* GET /exercises
* POST /exercises

### Progress

* POST /progress
* GET /progress/:userId

### PR

* POST /prs
* PUT /prs/:id/approve

### Leaderboard

* GET /leaderboard

### Attendance

* POST /attendance
* GET /attendance/:userId

---

## 🎨 Frontend Structure

/src

* /components
* /pages

  * /admin
  * /trainer
  * /user
  * /guest
* /services (API calls)
* /context (Auth)
* /hooks

---

## 📊 UI Features

### User Dashboard

* Today’s workout
* Progress charts
* Weight tracking
* Rank

### Admin Dashboard

* Total users
* Revenue
* Active subscriptions
* Leaderboard

---

## 📈 Charts (IMPORTANT)

* Weight progress chart
* Calories burn chart (burn-down style)
* Leaderboard visualization

---

## 🔒 Security

* JWT validation middleware
* Role-based route protection
* Input validation
* Hash passwords (bcrypt)

---

## 🚀 Deployment

Frontend:

* Vercel

Backend:

* Render / Railway

Database:

* Supabase

---

## ⚙️ Rules for AI Implementation

* Use modular folder structure
* Use clean REST APIs
* Separate controller, service, routes
* Use environment variables (.env)
* Follow scalable patterns

---

## 🧭 Future Enhancements (Do NOT build now)

* AI workout recommendations
* Multi-gym SaaS
* Mobile app
* Payment gateway

---

## ✅ Final Instruction

Build MVP first with:

* Auth
* Users
* Subscription
* Workout
* Progress

Then extend remaining modules.
