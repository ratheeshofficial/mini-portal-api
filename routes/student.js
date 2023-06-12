const router = require("express").Router();

const authMiddleWare = require("../middleware/authMiddleWare");
const Admin = require("../models/Admin");
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

router.get("/", authMiddleWare(), async (req, res) => {
  try {
    // User is not a superAdmin, return assignedTasks data
    const admin = await Admin.findOne({ _id: req.evaluator });
    console.log("admin", admin);

    if (admin.role === "superAdmin") {
      const admins = await Student.find({});
      return res.json(admins);
    }
    const assignedTasks = admin.assignedTasks;
    console.log("assignedTasks", assignedTasks);
    res.json(assignedTasks);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

router.put("/:id", async (req, res) => {
  const studentId = req.params.id;
  console.log("studentId", studentId);

  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      {
        name: req.body.name,
        desc: req.body.desc,
        country: req.body.country,
        gender: req.body.gender,
        file: req.body.file,
        accept: req.body.accept,
        assignee: req.body.assignee,
      },
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json(updatedStudent);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

router.post("/assign-tasks", async (req, res) => {
  const { studentId, adminId } = req.body;
  try {
    // Find the admin
    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({ message: "Evaluator not found" });
    }

    // Check if the student is already assigned a task
    const isAssigned = admin.assignedTasks.some(
      (task) => task._id.toString() === studentId
    );

    if (isAssigned) {
      return res
        .status(400)
        .json({ message: "Student already assigned a task" });
    }

    const student = await Student.findById(studentId);

    // Append the student object to assignedTasks array
    admin.assignedTasks.push(student);

    // Save the updated admin object
    await admin.save();

    res.status(200).json({ message: "Task assigned successfully" });
  } catch (error) {
    res.status(400).json(error.message);
  }
});

module.exports = router;
