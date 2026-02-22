# Online Quiz Platform

A full-stack, real-time quiz platform designed for teachers to create assessments and students to take timed exams with auto-grading.

## Features
- **Role-Based Access**: Specialized views for Teachers and Students.
- **Multi-Answer Quizzes**: Support for multiple correct options per question.
- **Real-Time Timer**: Synchronized client-server session tracking.
- **Auto-Grading**: Instant result calculation upon submission.
- **Results Tracking**: Teachers can view student performance and detailed scores.
- **Modern UI**: Clean, glassmorphism-inspired design with React.

## Tech Stack
- **Backend**: Go (Golang) with Gin Framework
- **Database**: MongoDB
- **Frontend**: React.js with Lucide Icons
- **Authentication**: JWT (JSON Web Tokens)

## API Documentation

### Public Endpoints
- `POST /register`: Create a new account (`username`, `password`, `role`).
- `POST /login`: Authenticate and receive a JWT token.

### Protected Endpoints (Requires JWT)
- `GET /quizzes`: List all available quizzes.

### Teacher Endpoints (Requires 'teacher' role)
- `POST /teacher/quiz`: Create a new quiz with questions and correct options.
- `GET /teacher/quizzes`: List quizzes created by the current teacher.
- `GET /teacher/results/:id`: Get student submissions for a specific quiz.

### Student Endpoints (Requires 'student' role)
- `POST /student/start`: Start a timed quiz session and fetch questions.
- `POST /student/submit`: Submit answers for grading.

## Getting Started

### Backend
1. Ensure MongoDB is running on `localhost:27017`.
2. Run `go run main.go`.
3. Server runs on `http://localhost:9090`.

### Frontend
1. Navigate to `/frontend`.
2. Run `npm install` and then `npm run dev`.
3. Access the app at `http://localhost:5173`.

### Demo Credits
- **Teacher**: `admin_teacher` / `teacher123`
- **Student**: `student_user` / `student123`
