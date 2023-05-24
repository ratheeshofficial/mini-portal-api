const express = require("express");
const app = express();
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const authAdmin = require("./routes/admin");
const studentAdmin = require("./routes/student");

dotenv.config();
app.use(express.json());

// Set up bodyParser middleware
app.use(bodyParser.urlencoded({ extended: false }));

mongoose
  .connect(process.env.MONGO_URL)
  .then(console.log("Connected to MongoDB"))
  .catch((err) => console.log(err.message));

app.use("/api/admin", authAdmin);
app.use("/api/student", studentAdmin);

app.listen("5000", () => {
  console.log("server is started in 5000...");
});
