# Timer & Session Management Implementation

This document explains the technical approach used to manage timed sessions and prevent cheating in the Online Quiz Platform.

## 1. Precise Session Tracking
When a student starts a quiz, the server calculates the absolute `EndTime` based on the current server time and the quiz duration:
```go
now := time.Now()
endTime := now.Add(time.Duration(quiz.Duration) * time.Minute)
```
This `EndTime` is stored in the `QuizSession` table. This ensures that even if the student refreshes their browser or closes the tab, the deadline remains fixed.

## 2. Server-Side Validation (The Source of Truth)
Client-side timers are easily manipulated. Therefore, the server performs a strict check upon submission:
```go
if time.Now().After(session.EndTime.Add(5 * time.Second)) {
    session.Status = "expired"
    // Reject submission
}
```
A **5-second buffer** is allowed to account for network latency, ensuring fair treatment for students with slower connections while preventing significant overruns.

## 3. Anti-Cheat Measures
To prevent students from "peeking" at answers via browser developer tools or network intercepts:
- **Omitted Data**: When the quiz questions are requested, the API returns a filtered list that excludes the `CorrectOption` field.
- **Auto-Grading**: Grading is performed entirely on the server. The client only sends the index of the selected option.
- **In-Memory Guard**: Correct answers are only retrieved from the database *after* the submission is received and validated against the timer.

## 4. Concurrency Handling
By using a relational database (SQLite/PostgreSQL) and unique session IDs:
- Each attempt is an isolated `QuizSession`.
- Multiple students can take the same quiz concurrently without interference.
- Database transactions (if scaled to PostgreSQL) ensure atomic updates to scores.
