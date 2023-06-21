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
    // console.log("admin", admin);

    if (admin.role === "superAdmin") {
      const admins = await Student.find().populate({ path: "assignedTo" });
      return res.json(admins);
    }

    if (admin.role === "evaluator") {
      const assignedTo = await Student.find({ assignedTo: admin._id });
      const assignedToId = assignedTo[0].assignedTo;

      const evaluatorId = admin._id.toString();

      if (assignedToId === evaluatorId) {
        return res.json(assignedTo);
      }
    }

    const assignedTasks = admin.assignedTasks;
    res.json(assignedTasks);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

router.put("/:id", async (req, res) => {
  const studentId = req.params.id;

  try {
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Check if the 'status' field exists in the student record
    if (!student.hasOwnProperty("status")) {
      student.status = req.body.status; // Add the 'status' field
    } else {
      student.status = req.body.status; // Update the existing 'status' field
    }

    await student.save();

    const updatedStudents = await Student.findByIdAndUpdate(
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

    if (!updatedStudents) {
      return res.status(404).json({ message: "Student not updated" });
    }

    res.status(200).json(updatedStudents);
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

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Check if the student is already assigned to any admin
    if (student.assignedTo && student.assignedTo !== adminId) {
      // Find the previously assigned admin
      const previousAdmin = await Admin.findOneAndUpdate(
        { "assignedTasks._id": studentId },
        { $pull: { assignedTasks: { _id: studentId } } }
      );

      if (previousAdmin) {
        // Save the updated previous admin object
        await previousAdmin.save();
      }
    }

    // Create a new task object for the assigned student
    const task = {
      _id: studentId,
      name: student.name,
      desc: student.desc,
      country: student.country,
    };

    // Append the task object to assignedTasks array
    admin.assignedTasks.push(task);

    // Save the updated admin object
    await admin.save();

    // Update the assignedTo field of the student
    student.assignedTo = adminId;
    await student.save();

    res.status(200).json({ message: "Task assigned successfully" });
  } catch (error) {
    res.status(400).json(error.message);
  }
});

module.exports = router;
