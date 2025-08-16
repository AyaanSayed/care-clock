# 🕒 CARE CLOCK

A full-stack **shift management application** built with **Next.js, Prisma, NextAuth, and TailwindCSS**.  
CARE CLOCK helps **care workers** and **managers** manage shifts effectively with features like clock-in/out tracking, history, dashboards, and location management.

---

## 🔎 Overview

CARE CLOCK is designed to **streamline shift management** for organizations where employees (care workers) need to record their work hours and managers need oversight.  
It provides **real-time tracking**, **historical insights**, and **performance dashboards** to improve accountability and efficiency.

---

## ✨ Features

### 👨‍⚕️ Care Worker
- **Clock In / Clock Out** shifts with optional notes.  
- **Shift History** with filters (date range, pagination).  
- **Responsive Navigation** for Home and History.  

### 👨‍💼 Manager
- **Dashboard** with metrics:
  - Avg working hours per day.
  - Number of people clocked in daily.
  - Weekly totals per care worker.  
- **Active Shifts** view with pagination.  
- **Manage Location** with auto-detect (GPS) or manual entry of latitude/longitude.  

### 🔒 Authentication
- Role-based authentication using **NextAuth**.  
- Secure API routes for managers and care workers.  

---

## 🛠 Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/), [React](https://react.dev/), [TailwindCSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)  
- **Backend**: [Next.js API Routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes)  
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)  
- **Auth**: [NextAuth](https://next-auth.js.org/)   

---

## ⚙️ Installation

Clone the repo:
```
git clone https://github.com/your-username/care-clock.git
cd care-clock

npm install
```

---
## Environment Variables
```
DATABASE_URL="your-database-url"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```



---
## 🗄 Database Setup

Run Prisma migrations:
```
npx prisma migrate dev
```


Generate Prisma Client:
```
npx prisma generate
```

---
## 🚀 Running the Project

Development mode:
```
npm run dev
```


Production build:
```
npm run build
npm start
```
---

## 📖 Usage Guide

- Sign in (care worker / manager).

Care worker:

- Clock In / Clock Out from Home page.

- View shift history with filters & pagination.

Manager:

- View Dashboard with metrics and charts.

- Check active shifts.

- Manage organization location (auto or manual latitude/longitude).

---
## 🔑 Demo Accounts

For quick review, you can use these demo accounts:

Care Worker:

Email: ayaan@mail.com  
Password: 12345678


Manager:

Email: manager1@mail.com  
Password: 12345678

---



