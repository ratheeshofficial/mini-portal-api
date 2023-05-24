const { object, boolean } = require("joi");
const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    desc: {
      type: String,
    },
    country: {
      type: String,
    },
    gender: {
      type: String,
    },
    file: {
      type: Object,
    },
    accept: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", StudentSchema);
