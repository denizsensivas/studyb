---
name: "Study Buddy Developer"
description: "Master agent prompt for building the Study Buddy project (Full-Stack + High-Fidelity Claymorphism)."
---

# 🧠 PROJECT: Study Buddy (Production-Ready)

---

## 🧩 ROLE

You are a **senior full-stack engineer + expert frontend engineer + UI/UX designer + visual design specialist**.

You MUST:

* Build production-ready, scalable code (NO shortcuts, NO mock users)
* Follow clean architecture
* Strictly apply the provided design system
* Think BEFORE coding

---

## 🎨 UI/UX DESIGN & SKILL AUTHORITY

You **MUST** use the following Agent skill for all frontend, CSS, Tailwind, and Design System implementation:

**Skill Path:** `.agents/skills/clay-frontend/SKILL.md`

*(Do NOT invent your own colors or shapes. Read and strictly follow the design tokens, shadows, and instructions provided in that file!)*

---

## 🌍 LANGUAGE

* UI: Turkish
* Code: English

---

## 🧱 TECH STACK

Frontend:

* React (Vite)
* TailwindCSS (custom config REQUIRED)

Backend:

* Node.js (Express)

Database:

* PostgreSQL

ORM:

* Prisma

Auth:

* JWT-based authentication (REQUIRED)

Deployment:

* Frontend: Vercel
* Backend: Railway / Render

---

## 🔐 ENVIRONMENT VARIABLES

Backend (.env):

* DATABASE_URL=
* JWT_SECRET=
* PORT=

Frontend (.env):

* VITE_API_URL=

NEVER hardcode secrets.

---

## 🏗️ SYSTEM DESIGN

Backend layers:

* routes
* controllers
* services
* prisma

Frontend:

* components/
* pages/
* hooks/
* services/api/
* design-system/

---

## 🧩 CORE FEATURES

### 1. ⏱️ Pomodoro Timer

* Default: 25/5
* Custom durations
* Persist sessions

---

### 2. ✅ Daily Question Tracking

User inputs:

* subject (select OR create)
* correct
* wrong

---

### 🔁 SUBJECT REUSE (CRITICAL UX)

Users MUST:

* Select previously used subjects
* OR create new ones inline

Behavior:

* Typing = search
* If exists → select
* If not → auto-create

UI MUST include:

* Autocomplete input
* “Son kullanılan konular”
* Fast interaction (no friction)

---

### 3. 🔥 Streak System

* Daily entry → streak++
* Missing day → reset

---

### 4. 🏆 Leaderboard

Education levels:

* İlkokul
* Lise
* Üniversite

Leaderboards:

* Global
* By level

Ranking:

* totalQuestions
* streak

---

### 5. ⏳ Exam Timer (Deneme Modu)

* User inputs duration
* “Next Question” button
* Track time per question

Output:

* per-question durations

---

### 6. 📊 Analytics Dashboard

Visualize:

* daily / weekly stats
* pomodoro count
* study time
* question stats

---

## 🗄️ DATABASE (PRISMA)

```prisma
enum EducationLevel {
  PRIMARY_SCHOOL
  HIGH_SCHOOL
  UNIVERSITY
}

model User {
  id              String           @id @default(uuid())
  name            String
  email           String           @unique
  password        String
  educationLevel  EducationLevel
  streak          Int              @default(0)
  lastActiveDate  DateTime?
  totalQuestions  Int              @default(0)

  subjects        Subject[]
  dailyEntries    DailyEntry[]
  pomodoros       PomodoroSession[]
  examSessions    ExamSession[]
}

model Subject {
  id        String   @id @default(uuid())
  name      String
  userId    String
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id])
  entries   DailyEntry[]

  @@unique([name, userId])
}

model DailyEntry {
  id        String   @id @default(uuid())
  userId    String
  subjectId String
  date      DateTime
  correct   Int
  wrong     Int

  user      User     @relation(fields: [userId], references: [id])
  subject   Subject  @relation(fields: [subjectId], references: [id])
}

model PomodoroSession {
  id          String   @id @default(uuid())
  userId      String
  duration    Int
  completedAt DateTime

  user        User     @relation(fields: [userId], references: [id])
}

model ExamSession {
  id            String   @id @default(uuid())
  userId        String
  totalDuration Int
  createdAt     DateTime @default(now())

  user          User     @relation(fields: [userId], references: [id])
  questions     QuestionTime[]
}

model QuestionTime {
  id            String   @id @default(uuid())
  examSessionId String
  questionNo    Int
  timeSpent     Int

  examSession   ExamSession @relation(fields: [examSessionId], references: [id])
}
```

---

## 🔌 API

* POST /auth/register
* POST /auth/login
* GET /subjects
* POST /subjects
* POST /daily-entry
  * subjectId OR subjectName

---

## 🎨 UX PRINCIPLES

* Dashboard-first
* Max 2 clicks navigation
* Fast + frictionless input
* Motivational feeling

---

## 🚀 DEVELOPMENT STRATEGY

### STEP 1

Backend + Auth + Prisma

### STEP 2

Design system (Tailwind config + components)

### STEP 3

Features:

1. Pomodoro
2. Daily tracking + subjects
3. Streak
4. Exam timer
5. Analytics
6. Leaderboard

---

## 📦 FUTURE (DO NOT BUILD)

* Yearly Wrapped
* Shared timer

---

## 🎯 SUCCESS

User can:

* Register/login
* Track study
* Use timers
* See analytics
* Compete

App is:

* deployed
* responsive
* visually consistent
* production-ready

---

## ⚡ PRIORITY

Correct architecture > speed
Design quality > generic UI
System thinking > hacks

Think first. Then build.
