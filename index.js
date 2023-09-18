// The Server
const express = require("express");
const mongoose = require("mongoose");
const User = require("./apis/users/user.schema");
const PORT = 4000;
const app = express();

app.use(express.json());

const router = express.Router();
app.use("/", router);

const userSchemaFields = { username: String, password: String, email: String };

// Create a model using the schema
const UserModel = mongoose.model("User", User.schema);

// Define a route to create a new user
router.post("/users", async (req, res, next) => {
  try {
    const { username, password, email } = req.body;

    // Create a new user document and save it to the database
    const newUser = await UserModel.create({ username, password, email });

    // Send a response with the created user document
    res.status(201).json({
      status: "00",
      message: "User created successfully",
      data: newUser,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      console.log(errors, "checking the error");
      return res.status(400).json({ errors });
    } else if (error.name === "MongoServerError" && error.code === 11000) {
      return res
        .status(400)
        .json({ error: "Username or email is already in use." });
    }
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Define a route to get a list of all users
router.get("/users", async (req, res, next) => {
  try {
    const users = await UserModel.find(); // Retrieve all user documents from the database

    // Send a response with the list of users
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/home", (req, res, next) => {
  res.status(200).send({
    message: "we dey here",
  });
});

const dbConnection = mongoose
  .connect("mongodb://127.0.0.1:27017/backend-test", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connected");
    // Start the server after successful database connection
    app.listen(PORT, () => {
      console.log(`App is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Not connected to Database!", err);
  });
