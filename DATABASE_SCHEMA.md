# Database Schema Documentation

The Online Quiz Platform uses MongoDB with the following collection structures.

## 1. Users (`users`)
Stores teacher and student account information.
```json
{
  "_id": "ObjectID",
  "username": "string (unique)",
  "password": "string (hashed)",
  "role": "string (teacher | student)",
  "created_at": "ISODate"
}
```

## 2. Quizzes (`quizzes`)
Contains quiz metadata and nested questions.
```json
{
  "_id": "ObjectID",
  "title": "string",
  "description": "string",
  "duration": "int (minutes)",
  "teacher_id": "ObjectID",
  "questions": [
    {
      "_id": "ObjectID",
      "text": "string",
      "options": ["string"],
      "correct_options": ["int (indices)"]
    }
  ],
  "created_at": "ISODate"
}
```

## 3. Quiz Sessions (`sessions`)
Tracks student attempts for a specific quiz.
```json
{
  "_id": "ObjectID",
  "quiz_id": "ObjectID",
  "student_id": "ObjectID",
  "start_time": "ISODate",
  "end_time": "ISODate (start_time + duration)",
  "status": "string (active | completed | expired)",
  "score": "int"
}
```

## 4. Submissions (`submissions`)
Records individual answer choices for grading and review.
```json
{
  "_id": "ObjectID",
  "session_id": "ObjectID",
  "question_id": "ObjectID",
  "answers": ["int (selected indices)"],
  "is_correct": "boolean"
}
```
