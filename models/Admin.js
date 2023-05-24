const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["superAdmin", "admin", "student"],
      default: "student",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", AdminSchema);
