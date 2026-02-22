package models

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type Role string

const (
	RoleTeacher Role = "teacher"
	RoleStudent Role = "student"
)

type User struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Username  string             `bson:"username" json:"username"`
	Password  string             `bson:"password" json:"password"`
	Role      Role               `bson:"role" json:"role"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
}

type Question struct {
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Text           string             `bson:"text" json:"text"`
	Options        []string           `bson:"options" json:"options"`
	CorrectOptions []int              `bson:"correct_options" json:"correct_options"`
}

type Quiz struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Title       string             `bson:"title" json:"title"`
	Description string             `bson:"description" json:"description"`
	Duration    int                `bson:"duration" json:"duration"`
	TeacherID   primitive.ObjectID `bson:"teacher_id" json:"teacher_id"`
	Questions   []Question         `bson:"questions" json:"questions"`
	CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
}

type QuizSession struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	QuizID    primitive.ObjectID `bson:"quiz_id" json:"quiz_id"`
	StudentID primitive.ObjectID `bson:"student_id" json:"student_id"`
	StartTime time.Time          `bson:"start_time" json:"start_time"`
	EndTime   time.Time          `bson:"end_time" json:"end_time"`
	Status    string             `bson:"status" json:"status"` // active, completed, expired
	Score     int                `bson:"score" json:"score"`
}

type Submission struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	SessionID  primitive.ObjectID `bson:"session_id" json:"session_id"`
	QuestionID primitive.ObjectID `bson:"question_id" json:"question_id"`
	Answers    []int              `bson:"answers" json:"answers"`
	IsCorrect  bool               `bson:"is_correct" json:"is_correct"`
}

var (
	Client      *mongo.Client
	DB          *mongo.Database
	Users       *mongo.Collection
	Quizzes     *mongo.Collection
	Sessions    *mongo.Collection
	Submissions *mongo.Collection
)

func InitDB(client *mongo.Client, dbName string) {
	Client = client
	DB = Client.Database(dbName)
	Users = DB.Collection("users")
	Quizzes = DB.Collection("quizzes")
	Sessions = DB.Collection("sessions")
	Submissions = DB.Collection("submissions")
}

func Context() (context.Context, context.CancelFunc) {
	return context.WithTimeout(context.Background(), 10*time.Second)
}
