# HopCare - Smart Healthcare Platform

A complete full-stack healthcare application designed for patients and doctors. Features appointment booking, dashboard management, and a smart rule-based symptom checker.

## 🛠 Technology Stack (Beginner Friendly)

- **Frontend:** React, Tailwind CSS, Lucide Icons
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (using Mongoose)
- **AI/Logic:** Rule-based keyword matching algorithm (No external API keys required)
- **Security:** JWT Authentication, Visual Canvas CAPTCHA

## 🚀 Project Structure

```
/
├── backend/                # Node.js Backend Code
│   ├── models/             # Mongoose Database Models
│   ├── server.js           # Main Express Server
│   └── package.json        # Backend Dependencies
├── src/                    # React Frontend Code
│   ├── pages/              # Application Pages
│   ├── components/         # Reusable Components
│   └── services/           # API Services
└── README.md               # This file
```

## 🏁 Getting Started

### 1. Backend Setup (Node.js + MongoDB)

You need MongoDB installed locally or a MongoDB Atlas connection string.

1.  Navigate to the `backend` folder (you may need to create this locally if copying from a preview environment).
2.  Install dependencies:
    ```bash
    cd backend
    npm install
    ```
3.  Start the server:
    ```bash
    node server.js
    ```
    *The backend runs on `http://localhost:5000` by default.*

### 2. Frontend Setup (React)

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Start the development server:
    ```bash
    npm run dev
    ```
    *The frontend runs on `http://localhost:5173` (or similar).*

## 🔌 Connecting Frontend to Real Backend

By default, the frontend uses a **Mock Backend** (`services/mockBackend.ts`) so you can preview the app immediately without a server.

To switch to the **Real Node.js Backend**:

1.  Open `src/context/AuthContext.tsx`.
2.  Replace imports from `../services/mockBackend` with `../services/api`.
3.  Open `src/pages/*.tsx` and replace `mockBackend` usage with the corresponding functions from `../services/api.ts`.

## 🧪 Key Features

1.  **Smart Symptom Checker:**
    - Uses a rule-based algorithm in the backend to analyze symptoms and suggest specialists.
    - Located in `backend/server.js` (endpoint `/api/ai/predict`).

2.  **Visual CAPTCHA:**
    - Custom Canvas-based implementation in `Auth.tsx`.
    - Generates random alphanumeric codes with noise and rotation.

3.  **Role-Based Dashboards:**
    - **Patient:** Book appointments, view history, check symptoms.
    - **Doctor:** Manage appointment requests, update status.
