
# FlowFund – Modern Fundraising Portal

**FlowFund** is a sleek, responsive web platform designed to empower individuals and organizations to raise hope through meaningful fundraisers. Built using modern web technologies, it delivers a seamless and professional user experience across all devices.

> 🌐 **Live Site:** [https://fundflow-aj9w.onrender.com](https://fundflow-aj9w.onrender.com)  
---

## 🛠️ Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Lucide React](https://img.shields.io/badge/Lucide-000000?style=for-the-badge&logo=lucide&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Render](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Firebase Hosting](https://img.shields.io/badge/Firebase_Hosting-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

---

## ⚙️ Features

- **Dark / Light Theme Toggle** — Supports both system preferences and manual switching.
- **Animated Branded Header** — Gradient-styled header with smooth entrance animations.
- **Firebase Authentication** — Supports Google sign-in and email/password login.
- **Fundraising Dashboard** — View and manage your campaigns at a glance.
- **Donation & Withdrawal Interface** — Seamless handling of fund flow in/out.
- **User Profile Management** — Update personal info.
- **Realtime Firebase Integration** — Sync and store data instantly using Realtime DB.
- **Modals & Toast Notifications** — Clean confirmations and status alerts across actions.

---

## 📁 Project Structure

```
/app                → Next.js app directory  
/components         → Reusable UI components (e.g., BrandHeader)  
/lib/firebase.ts    → Firebase configuration  
/styles             → Tailwind config & global styles  
/public             → Static assets (images, icons)  
```

---

## 🧪 Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/me-As-Raki/FundFlow.git
   cd FundFlow
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Add Firebase credentials in `.env.local`:**
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

---

## 🚀 Production Build

```bash
npm run build
npm run start
```

---

> ✨ Made with 💚 by [Rakesh G.](https://github.com/me-As-Raki) – for the internship portal assignment.
