package main

import (
	"context"
	"log"
	"quiz-platform/handlers"
	"quiz-platform/middleware"
	"quiz-platform/models"
	"quiz-platform/utils"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	// Initialize MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal("Failed to ping MongoDB:", err)
	}

	models.InitDB(client, "quiz_db")
	seedDatabase()

	r := gin.Default()

	// CORS Middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// Public Routes
	r.POST("/register", handlers.Register)
	r.POST("/login", handlers.Login)

	// Protected Routes
	auth := r.Group("/")
	auth.Use(middleware.AuthMiddleware())
	{
		// Common
		auth.GET("/quizzes", handlers.ListQuizzes)

		// Teacher Routes
		teacher := auth.Group("/teacher")
		teacher.Use(middleware.RoleMiddleware("teacher"))
		{
			teacher.POST("/quiz", handlers.CreateQuiz)
			teacher.GET("/quizzes", handlers.GetTeacherQuizzes)
			teacher.GET("/results/:id", handlers.GetQuizResults)
		}

		// Student Routes
		student := auth.Group("/student")
		student.Use(middleware.RoleMiddleware("student"))
		{
			student.POST("/start", handlers.StartQuizSession)
			student.POST("/submit", handlers.SubmitQuiz)
		}
	}

	r.Run(":9090")
}

func seedDatabase() {
	ctx, cancel := models.Context()
	defer cancel()

	// Seed demo accounts if they don't exist
	var teacher models.User
	err := models.Users.FindOne(ctx, bson.M{"username": "admin_teacher"}).Decode(&teacher)
	if err == mongo.ErrNoDocuments {
		hashedPass, _ := utils.HashPassword("teacher123")
		models.Users.InsertOne(ctx, models.User{
			Username: "admin_teacher",
			Password: hashedPass,
			Role:     models.RoleTeacher,
		})
	}

	var student models.User
	err = models.Users.FindOne(ctx, bson.M{"username": "student_user"}).Decode(&student)
	if err == mongo.ErrNoDocuments {
		hashedPass, _ := utils.HashPassword("student123")
		models.Users.InsertOne(ctx, models.User{
			Username: "student_user",
			Password: hashedPass,
			Role:     models.RoleStudent,
		})
	}
}
