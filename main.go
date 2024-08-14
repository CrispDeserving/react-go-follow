package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Todo struct {
	ID        primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Completed bool               `json:"completed" bson:"completed"`
	Body      string             `json:"body" bson:"body"`
}

var collection *mongo.Collection

func main() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("Failed to load .env file")
	}

	MONGODB_URI := os.Getenv("MONGODB_URI")
	databaseName := os.Getenv("DATABASE_NAME")
	collectionName := os.Getenv("COLLECTION_NAME")

	client := mongoConnect(MONGODB_URI)
	defer client.Disconnect(context.Background())

	collection = client.Database(databaseName).Collection(collectionName)

	app := fiber.New()
	fiberAddRoutes(app)

	PORT := os.Getenv("PORT")
	if PORT == "" {
		PORT = "5000"
	}

	log.Fatal(app.Listen(":" + PORT))
}

func mongoConnect(MONGODB_URI string) *mongo.Client {
	clientOptions := options.Client().ApplyURI(MONGODB_URI)

	client, err := mongo.Connect(context.Background(), clientOptions)
	if err != nil {
		log.Fatal(err)
	}

	err = client.Ping(context.Background(), nil)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Connected to MongoDB Atlas!")
	return client
}

func fiberAddRoutes(app *fiber.App) {
	app.Get("/api/todos", getTodos)
	app.Post("/api/todos", createTodo)
	app.Patch("/api/todos/:id/completion", updateTodo)
	app.Delete("/api/todos/:id", deleteTodo)
}

func getTodos(c *fiber.Ctx) error {
	var todos []Todo

	cursor, err := collection.Find(context.Background(), bson.M{})
	if err != nil {
		return err
	}
	defer cursor.Close(context.Background())

	for cursor.Next(context.Background()) {
		var todo Todo
		if err := cursor.Decode(&todo); err != nil {
			return err
		}

		todos = append(todos, todo)
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"todos": todos,
		"count": len(todos),
	})
}

func createTodo(c *fiber.Ctx) error {
	todo := new(Todo)
	if err := c.BodyParser(todo); err != nil {
		return err
	}

	if todo.Body == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Todo body property cannot be empty"})
	}

	insertResult, err := collection.InsertOne(context.Background(), todo)
	if err != nil {
		return nil
	}

	todo.ID = insertResult.InsertedID.(primitive.ObjectID)
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"todo": todo})
}

func updateTodo(c *fiber.Ctx) error {
	id := c.Params("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid todo id"})
	}

	var todo Todo
	todoResult := collection.FindOne(context.Background(), bson.M{"_id": objectID})
	err = todoResult.Decode(&todo)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Error in fetching the original todo"})
	}

	updatedCompleted := !todo.Completed
	_, err = collection.UpdateOne(context.Background(), bson.M{"_id": objectID}, bson.M{"$set": bson.M{"completed": updatedCompleted}})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Error in updating the todo"})
	}

	todo.Completed = updatedCompleted
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"todo": todo})
}

func deleteTodo(c *fiber.Ctx) error {
	id := c.Params("id")

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid todo ID"})
	}

	_, err = collection.DeleteOne(context.Background(), bson.M{"_id": objectID})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Error deleting the todo"})
	}

	return c.SendStatus(fiber.StatusNoContent)
}
