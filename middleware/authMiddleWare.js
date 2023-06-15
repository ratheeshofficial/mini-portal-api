var jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const authMiddleWare = (message) => async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return "token not found";
  const isValid = jwt.verify(token, "securityKey");
  const admin = await Admin.findById({ _id: isValid?.AdminId });
  if (!admin) return "admin not found";
  req.evaluator = admin?._id;
  next();
};

module.exports = authMiddleWare;
