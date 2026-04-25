# 🚀 CodeSprint 50

Welcome to **CodeSprint 50**, your ultimate 50-day placement preparation platform!

Are you ready to transform your coding skills and land your dream tech job? CodeSprint 50 is a structured, intensive 50-day bootcamp designed specifically for students to master the core skills required for software engineering placements. 

Say goodbye to scattered resources and confusing roadmaps. CodeSprint provides a single, unified platform where you can learn, practice, and prove your readiness to potential employers.

---

## 🎯 What Will You Achieve?

From Day 1 to Day 50, you will embark on a comprehensive journey covering:

*   **☕ Core Java:** Master object-oriented programming, collections, and advanced concepts.
*   **🧠 Data Structures & Algorithms (DSA):** Build a strong foundation in problem-solving and algorithmic thinking.
*   **🗄️ SQL & Databases:** Learn to design, query, and manage relational databases effectively.
*   **💡 Aptitude & Logic:** Sharpen your quantitative and logical reasoning skills to ace the first round of any interview.

## ✨ Platform Features (Student Perspective)

### 🗺️ Structured 50-Day Curriculum
No more guessing what to learn next. Every day unlocks a carefully curated module containing theory, multiple-choice questions, and hands-on coding tasks. You must complete today's challenges to unlock tomorrow's! 

### 💻 In-Browser IDE with AI Grading
No need to install complex software on your machine! Write, run, and test your code directly in your browser. Our **seamless, zero-cost in-browser IDE** lets you execute Java code instantly. Plus, our **AI-driven grading system** analyzes your code, provides real-time feedback, and helps you optimize your solutions—just like a real interviewer would.

### 🔥 Gamification & Streaks
Stay motivated by building a daily learning streak! 
*   **Earn points** for every module you complete.
*   **Track your progress** visually on your personalized dashboard.
*   **Compete on the Leaderboard** to see how you stack up against other learners.
*   **Unlock achievement badges** as you hit major milestones.

### 📊 Readiness Report & Employer Sharing
As you progress through the 50 days, the platform automatically tracks your performance across all categories (Java, DSA, SQL, Aptitude). Generate a comprehensive **Readiness Profile** detailing your strengths. With a single click, share your verified progress directly on LinkedIn or with recruiters to prove you have what it takes!

### 🧩 Minimalist, Focus-Driven Interface
Inspired by the clean aesthetics of top coding platforms, CodeSprint features a modern, distraction-free UI. With an integrated split-screen code editor, your only focus is on writing great code and learning new concepts.

---

## 🚀 How to Get Started

1. **Sign Up / Log In**: Create your student account on the platform.
2. **Access Your Dashboard**: View your overall progress, streak, and daily tasks.
3. **Start Day 1**: Dive into your first module. Read the theory, solve the MCQs, tackle the coding snippet, and finish with the aptitude task.
4. **Build Your Habit**: Log in every day to keep your streak alive and unlock the next day's content!

---

<details>
<summary><b>🛠️ Technical Details (For Developers & Instructors)</b></summary>

### Tech Stack
*   **Frontend**: React, Vite, Tailwind CSS v4, Lucide React (Icons), React Router
*   **Backend**: Node.js, Express, JWT Authentication
*   **Database**: MongoDB & Mongoose
*   **Execution & AI**: Custom Code Compiler routes and AI grading endpoints.

### 🏃‍♂️ How to Run Locally

#### Prerequisites
1. **Node.js**: Ensure Node.js is installed locally.
2. **MongoDB**: Have MongoDB running locally on `mongodb://127.0.0.1:27017` (default).

#### Step 1: Set Up and Run the Backend
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
   *(You should see a success message: "50 Days of Data Imported Successfully!")*
4. Start the backend server:
   ```bash
   npm run dev
   ```
   *(The server will run on `http://localhost:5000`)*

#### Step 2: Set Up and Run the Frontend
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
</details>
