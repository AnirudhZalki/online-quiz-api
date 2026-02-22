package handlers

import (
	"net/http"
	"quiz-platform/models"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type CreateQuizInput struct {
	Title       string          `json:"title" binding:"required"`
	Description string          `json:"description"`
	Duration    int             `json:"duration" binding:"required"` // Minutes
	Questions   []QuestionInput `json:"questions" binding:"required,dive"`
}

type QuestionInput struct {
	Text           string   `json:"text" binding:"required"`
	Options        []string `json:"options" binding:"required,min=2"`
	CorrectOptions []int    `json:"correct_options" binding:"required,min=1"`
}

func CreateQuiz(c *gin.Context) {
	var input CreateQuizInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userIDStr, _ := c.Get("userID")
	userID, _ := primitive.ObjectIDFromHex(userIDStr.(string))

	var questions []models.Question
	for _, qInput := range input.Questions {
		questions = append(questions, models.Question{
			ID:             primitive.NewObjectID(),
			Text:           qInput.Text,
			Options:        qInput.Options,
			CorrectOptions: qInput.CorrectOptions,
		})
	}

	quiz := models.Quiz{
		ID:          primitive.NewObjectID(),
		Title:       input.Title,
		Description: input.Description,
		Duration:    input.Duration,
		TeacherID:   userID,
		Questions:   questions,
		CreatedAt:   time.Now(),
	}

	ctx, cancel := models.Context()
	defer cancel()

	_, err := models.Quizzes.InsertOne(ctx, quiz)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create quiz"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Quiz created successfully", "quiz_id": quiz.ID.Hex()})
}

func GetTeacherQuizzes(c *gin.Context) {
	userIDStr, _ := c.Get("userID")
	userID, _ := primitive.ObjectIDFromHex(userIDStr.(string))

	ctx, cancel := models.Context()
	defer cancel()

	cursor, err := models.Quizzes.Find(ctx, bson.M{"teacher_id": userID})
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

func GetQuizResults(c *gin.Context) {
	quizIDStr := c.Param("id")
	quizID, _ := primitive.ObjectIDFromHex(quizIDStr)

	ctx, cancel := models.Context()
	defer cancel()

	cursor, err := models.Sessions.Find(ctx, bson.M{"quiz_id": quizID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch results"})
		return
	}
	defer cursor.Close(ctx)

	var sessions []models.QuizSession
	if err = cursor.All(ctx, &sessions); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not decode results"})
		return
	}

	c.JSON(http.StatusOK, sessions)
}
