# CodeSprint 50

A full-stack edtech platform designed to help beginners master coding from scratch via a structured 50-day challenge.

## Features Included 🚀
- **50-Day Roadmap System**: Day 1 unlocked by default, subsequent days unlock after completion.
- **Interactive Day Modules**:
  - Video Integration (Mock Youtube embeds)
  - MCQ Knowledge Check (Live scoring)
  - Web IDE Code Execution (Mock output for safety)
  - Aptitude Practice (With hints & explanations)
- **Gamification**: Visual streaks, accumulative scoring, and completion badges.
- **Mock Subscription**: A payment flow to unlock all days (Day 5+).
- **Social Sharing**: One-click copy for LinkedIn sharing.
- **Full Auth**: JWT-based login/signup system.

## Tech Stack 🛠️
- **Frontend**: React, Vite, Tailwind CSS v4, Lucide React (Icons), React Router
- **Backend**: Node.js, Express, JWT Authentication
- **Database**: MongoDB & Mongoose

---

## 🏃‍♂️ How to Run Locally

### Prerequisites
1. **Node.js**: Ensure Node.js is installed locally.
2. **MongoDB**: Have MongoDB running locally on `mongodb://127.0.0.1:27017` (default).

### Step 1: Set Up and Run the Backend
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. **Seed the Database** with 50 days of dummy data:
   ```bash
   node seed.js
   ```
   *You should see a success message: "50 Days of Data Imported Successfully!"*
4. Start the backend server:
   ```bash
   npm run dev
   ```
   *The server will run on `http://localhost:5000`.*

### Step 2: Set Up and Run the Frontend
1. Open a **new** terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the application in your browser at `http://localhost:5173`.

---

## 👤 Test User Account
You can register your own account via the Sign Up page, or use any newly registered account to test the system!
- Create an account -> View Dashboard -> Click "Start Learning" on Day 1.
- Complete the video, MCQs, Coding snippet, and Aptitude task to unlock Day 2!
