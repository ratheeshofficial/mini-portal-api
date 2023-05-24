const router = require("express").Router();

const Student = require("../models/Student");

router.post("/", async (req, res) => {
  try {
    const newStudent = await Student({
      name: req.body.name,
      desc: req.body.desc,
      country: req.body.country,
      gender: req.body.gender,
      file: req.body.file,
      accept: req.body.accept,
    });
    const student = await newStudent.save();
    res.status(200).json(student);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

module.exports = router;
