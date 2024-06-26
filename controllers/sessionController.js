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
// Function to link a Parent to a Student
const linkStudent = async (req, res) => {
  const { studentEmail } = req.body;
  const parentEmail = req.user.email; // Assuming you have a way to get the current user's email
  try {
      const parent = await User.findOne({ email: parentEmail, role: 'parent' });
      if (!parent) {
          return res.status(404).send('Parent user not found');
      }
      const student = await User.findOne({ email: studentEmail, role: 'student' });
      if (!student) {
          return res.status(404).send('Student user not found');
      }      
      parent.childId = student._id;// Link the Student to the Parent
      await parent.save();
      res.send(`Linked ${studentEmail} to ${parentEmail} successfully.`);
  } catch (error) {
      console.error('Error linking Parent to Student:', error);
      res.status(500).send('An error occurred while linking the users');
  }
};

// Function to connect a Parent to a Student
const connectChild = (req, res) => {
  if (req.user.role === 'parent') {
    res.render('connectChild', { csrfToken: req.csrfToken() });
  } else {
    res.redirect('/');
  }
};
// Connect a Parent to a Student
const connectParentToStudent = async (req, res) => {
  const parentEmail = req.user.email; 
  const studentEmail = req.body.studentEmail; // The Student's email entered in the form
    try {
        // Find the Student by email
        const student = await User.findOne({ email: studentEmail, role: 'student' });
        if (!student) {
            return res.status(404).send('Student not found');
        }
        // Update the Parent's childId to reference the Student's ID
        await User.findOneAndUpdate({ email: parentEmail, role: 'parent' }, { childId: student._id });

        // Redirect to the /schools page with the Student's ID
        res.redirect(`/schools?studentId=${student._id}`);
    } catch (error) {
        console.error('Error connecting Parent to Student:', error);
        res.status(500).send('Server error');
    }
};

module.exports = {
  registerShow,
  registerDo,
  logoff,
  logonShow,
  connectChild,
  connectParentToStudent
}; 