# Online Quiz Platform (MongoDB Version)

Welcome to the Online Quiz Platform! This version uses **MongoDB** as the backend database for high flexibility and performance.

---

## 🚀 Quick Start (Step-by-Step)

Follow these steps exactly to get the platform running on your machine.

### 1. Prerequisites
Make sure you have the following installed:
- [Go](https://go.dev/dl/) (v1.23+)
- [Node.js](https://nodejs.org/) (includes npm)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) (running locally on default port 27017)

### 2. Backend Setup
1. Open a terminal in the project root directory.
2. Install the backend dependencies:
   ```bash
   go mod tidy
   ```
3. Run the Go server:
   ```bash
   go run main.go
   ```
   > **Note:** The server will automatically connect to `mongodb://localhost:27017`, create a `quiz_db` database, and seed it with demo accounts.

### 3. Frontend Setup
1. Open a **new** terminal window.
2. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
3. Install the frontend dependencies:
   ```bash
   npm install
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open the provided URL (e.g., http://localhost:5173) in your browser.

---

## 🔑 Demo Credentials

The database is self-seeding with these testing accounts:

### 👨‍🏫 Teacher Account
- **Username:** `admin_teacher`
- **Password:** `teacher123`

### 👨‍🎓 Student Account
- **Username:** `student_user`
- **Password:** `student123`

---

## 🏗 Tech Stack
- **Backend:** Go, Gin, MongoDB Driver.
- **Frontend:** React + Vite, Vanilla CSS.
- **Auth:** JWT (JSON Web Tokens).
- **Icons:** Lucide-React.
