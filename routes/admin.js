const router = require("express").Router();
const bcrypt = require("bcryptjs");
const sgMail = require("@sendgrid/mail");
const Joi = require("joi");
var jwt = require("jsonwebtoken");

const Admin = require("../models/Admin");

const validateData = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
      .required(),
    role: Joi.string(),
    // repeat_password: Joi.ref('password'),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  next();
};

const getAdmin = async (email) => {
  return await Admin.findOne({ email });
};

// REGISTER
router.post("/register", validateData, async (req, res) => {
  try {
    const isEmailExist = await getAdmin(req.body.email);

    if (isEmailExist) {
      return res.status(500).json({ message: "email exist" });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPass = bcrypt.hashSync(req.body.password, salt);
    const newAdmin = new Admin({
      email: req.body.email,
      password: hashedPass,
      role: req.body.role,
    });
    const admin = await newAdmin.save();
    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

//Get Admin
router.get("/", async (req, res) => {
  try {
    const getAdmin = await Admin.find();
    res.status(200).json(getAdmin);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const admin = await Admin.findOne({ email: req.body.email });
    if (!admin) return res.status(400).json("email not found");

    var token = jwt.sign({ AdminId: admin._id }, "securityKey");

    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      admin.password
    );

    if (!isPasswordCorrect)
      return res.status(400).json("Wrong password or email");
    const { password, ...others } = admin._doc;
    res.status(200).json({ ...others, token });
  } catch (err) {
    res.status(500).json(err.message);
  }
});

//Forgot password

router.post("/forgot-password", async (req, res) => {
  // const { email } = req.body;
  const admin = await Admin.findOne({ email: req.body.email });

  if (!admin) {
    return res.status(400).json("email does not exist");
  }

  // Generate a random token
  const token = jwt.sign({ adminId: admin._id }, "securityKey");

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to: admin.email,
    from: "rubeshrasiah@gmail.com",
    subject: "Password Reset",
    text: `Please click on the following link to reset your password: http://localhost:3000/reset-password/${token}`,
    html: `<strong>Please click on the following link to reset your password: <a href="http://localhost:3000/reset-password/${token}">Reset Password</a></strong>`,
  };

  sgMail
    .send(msg)
    .then(() => {
      res.send("Password reset email sent");
    })
    .catch((error) => {
      console.error(error.message);
      res.send(error);
    });
});

router.post("/reset-password/:token", async (req, res) => {
  // const token = jwt.sign({ adminId: "admin" }, "AdminResetKey");
  try {
    const { token } = req.params;
    const isValid = jwt.verify(token, "securityKey");
    if (!isValid) {
      res.status(403).json("error in verify token");
    }
    const admin = await Admin.findOne({ _id: isValid.adminId });
    const salt = bcrypt.genSaltSync(10);
    const hashedPass = bcrypt.hashSync(req.body.password, salt);
    Object.assign(admin, { password: hashedPass });
    const adminData = await admin.save();

    res.status(200).json(adminData);
  } catch (error) {
    res.status(404).json(error.message);
  }
});

module.exports = router;
