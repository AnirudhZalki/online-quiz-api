# Timer & Session Implementation

The platform implements a multi-layered timer and anti-cheat system to ensure quiz integrity.

## 1. Session Lifecycle
- **Initiation**: When a student starts a quiz, the server creates a `QuizSession`.
- **Server-Side Expiry**: The server calculates `now + quiz.duration` and stores it as `end_time`.
- **Data Security**: Questions are returned *without* correct options to the student.

## 2. Frontend Enforcement
- **Countdown**: The React frontend uses `setInterval` to display a real-time countdown.
- **Auto-Submission**: If the client-side timer hits zero, the frontend automatically triggers the `/submit` endpoint with currently selected answers.
- **Navigation Safety**: The student is locked into the quiz view via state management.

## 3. Backend Verification (Critical)
The backend provides final enforcement during submission to prevent client-side bypasses:
- **Timestamp Check**: On `/submit`, the server checks if `time.now()` is before `session.end_time + 5s` (buffer for network latency).
- **Status Guard**: Only sessions with "active" status are accepted for grading.
- **Expiry Action**: If a student submits late, the session is marked as "expired" and no score is recorded.

## 4. Multi-Answer Grading
- Answers are submitted as arrays of indices.
- The server uses exact-set matching: a question is marked correct ONLY if the student's selected options exactly match the correct options defined by the teacher.
