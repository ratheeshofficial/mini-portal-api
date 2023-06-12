var jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const authMiddleWare = (message) => async (req, res, next) => {
  console.log("first");
  const token = req.headers.authorization;
  console.log("aa", token);
  if (!token) return "token not found";
  console.log("gg");
  const isValid = jwt.verify(token, "securityKey");
  console.log("isValid", isValid);
  const admin = await Admin.findById({ _id: isValid?.AdminId });
  if (!admin) return "admin not found";
  req.evaluator = admin?._id;
  console.log("second");
  next();
};

module.exports = authMiddleWare;
