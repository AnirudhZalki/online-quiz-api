package handlers

import (
	"net/http"
	"quiz-platform/models"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type StartSessionInput struct {
	QuizID string `json:"quiz_id" binding:"required"`
}

type SubmitQuizInput struct {
	SessionID string        `json:"session_id" binding:"required"`
	Answers   []AnswerInput `json:"answers" binding:"required,dive"`
}

type AnswerInput struct {
	QuestionID string `json:"question_id" binding:"required"`
	Answers    []int  `json:"answers" binding:"required"` // Indices
}

func ListQuizzes(c *gin.Context) {
	ctx, cancel := models.Context()
	defer cancel()

	cursor, err := models.Quizzes.Find(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch quizzes"})
		return
	}
	defer cursor.Close(ctx)

	var quizzes []models.Quiz
	if err = cursor.All(ctx, &quizzes); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not decode quizzes"})
		return
	}

	c.JSON(http.StatusOK, quizzes)
}

func StartQuizSession(c *gin.Context) {
	var input StartSessionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	quizID, _ := primitive.ObjectIDFromHex(input.QuizID)

	ctx, cancel := models.Context()
	defer cancel()

	var quiz models.Quiz
	if err := models.Quizzes.FindOne(ctx, bson.M{"_id": quizID}).Decode(&quiz); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Quiz not found"})
		return
	}

	userIDStr, _ := c.Get("userID")
	userID, _ := primitive.ObjectIDFromHex(userIDStr.(string))

	// Create Session
	now := time.Now()
	endTime := now.Add(time.Duration(quiz.Duration) * time.Minute)

	session := models.QuizSession{
		ID:        primitive.NewObjectID(),
		QuizID:    quiz.ID,
		StudentID: userID,
		StartTime: now,
		EndTime:   endTime,
		Status:    "active",
	}

	_, err := models.Sessions.InsertOne(ctx, session)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not start session"})
		return
	}

	// Fetch Questions (WITHOUT CorrectAnswer - Anti-Cheat)
	type PublicQuestion struct {
		ID      primitive.ObjectID `json:"id"`
		Text    string             `json:"text"`
		Options []string           `json:"options"`
	}

	var publicQuestions []PublicQuestion
	for _, q := range quiz.Questions {
		publicQuestions = append(publicQuestions, PublicQuestion{
			ID:      q.ID,
			Text:    q.Text,
			Options: q.Options,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"session_id": session.ID.Hex(),
		"end_time":   endTime,
		"questions":  publicQuestions,
	})
}

func SubmitQuiz(c *gin.Context) {
	var input SubmitQuizInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	sessionID, _ := primitive.ObjectIDFromHex(input.SessionID)

	ctx, cancel := models.Context()
	defer cancel()

	var session models.QuizSession
	if err := models.Sessions.FindOne(ctx, bson.M{"_id": sessionID}).Decode(&session); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Session not found"})
		return
	}

	if session.Status != "active" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Session is already closed"})
		return
	}

	// Timer Validation (Server-Side)
	if time.Now().After(session.EndTime.Add(5 * time.Second)) { // 5s buffer
		models.Sessions.UpdateOne(ctx, bson.M{"_id": sessionID}, bson.M{"$set": bson.M{"status": "expired"}})
		c.JSON(http.StatusForbidden, gin.H{"error": "Time expired!"})
		return
	}

	// Fetch Quiz for Answers
	var quiz models.Quiz
	if err := models.Quizzes.FindOne(ctx, bson.M{"_id": session.QuizID}).Decode(&quiz); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch quiz for grading"})
		return
	}

	score := 0
	questionMap := make(map[primitive.ObjectID]models.Question)
	for _, q := range quiz.Questions {
		questionMap[q.ID] = q
	}

	for _, ansInput := range input.Answers {
		qID, _ := primitive.ObjectIDFromHex(ansInput.QuestionID)
		if q, ok := questionMap[qID]; ok {
			isCorrect := compareSlices(q.CorrectOptions, ansInput.Answers)
			if isCorrect {
				score++
			}
			// Record submission
			models.Submissions.InsertOne(ctx, models.Submission{
				ID:         primitive.NewObjectID(),
				SessionID:  session.ID,
				QuestionID: q.ID,
				Answers:    ansInput.Answers,
				IsCorrect:  isCorrect,
			})
		}
	}

	models.Sessions.UpdateOne(ctx, bson.M{"_id": sessionID}, bson.M{"$set": bson.M{
		"score":  score,
		"status": "completed",
	}})

	c.JSON(http.StatusOK, gin.H{
		"message": "Quiz submitted successfully",
		"score":   score,
		"total":   len(quiz.Questions),
	})
}

func compareSlices(a, b []int) bool {
	if len(a) != len(b) {
		return false
	}
	m := make(map[int]int)
	for _, v := range a {
		m[v]++
	}
	for _, v := range b {
		if m[v] == 0 {
			return false
		}
		m[v]--
	}
	return true
}
