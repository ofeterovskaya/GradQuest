const User = require("../models/User");
const School = require("../models/School"); 
const parseVErr = require("../utils/parseValidationErrs");

const registerShow = (req, res) => {
  res.render("register", { csrfToken: req.csrfToken() });
};

const registerDo = async (req, res) => {
  try {
    if (req.body.password !== req.body.password1) {
      // throwing password error here gets caught below
      throw new Error("The passwords do not match.");
    }
    await User.create(req.body);
    if (req.body.userType === 'student') {
      // Create a student profile linked to the user
      await StudentProfile.create({ userId: user._id, ...req.body.studentDetails });
    }
    
    res.redirect("/");
  } catch (e) {
    if (e.constructor.name === "ValidationError") {
      parseVErr(e, req);
    } else if (e.name === "MongoServerError" && e.code === 11000) {
      req.flash("error", "That email address is already registered.");
    } else {
      req.flash("error", e.message);
    }
    res.render("register", { errors: req.flash("error"), csrfToken: req.csrfToken() });
  }
};

const logoff = (req, res) => {
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
    }
    res.redirect("/");
  });
};

const logonShow = (req, res) => {
    return req.user ? res.redirect("/") : res.render("logon", { csrfToken: req.csrfToken() });
};

const connectChild = (req, res) => {
  if (req.user && req.user.role === 'parent') {
    res.render('connectStudent', { csrfToken: req.csrfToken() });
  } else {
    res.redirect('/');
  }
};
module.exports = {
  registerShow,
  registerDo,
  logoff,
  logonShow,
  connectChild
};