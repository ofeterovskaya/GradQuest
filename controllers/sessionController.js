const User = require('../models/User');
const parseVErr = require('../utils/parseValidationErrs');

const registerShow = (req, res) => {
  res.render('register', { csrfToken: req.csrfToken() });
};

const registerDo = async (req, res) => {
  try {
    if (req.body.password !== req.body.password1) {
      throw new Error('The passwords do not match.'); // throwing password error here gets caught below
    }
    await User.create(req.body);
    if (req.body.userType === 'student') {
      await StudentProfile.create({
        userId: user._id,
        ...req.body.studentDetails
      }); // Create a student profile linked to the user
    }
    res.redirect('/');
  } catch (e) {
    if (e.constructor.name === 'ValidationError') {
      parseVErr(e, req);
    } else if (e.name === 'MongoServerError' && e.code === 11000) {
      req.flash('error', 'That email address is already registered.');
    } else {
      req.flash('error', e.message);
    }
    res.render('register', {
      errors: req.flash('error'),
      csrfToken: req.csrfToken()
    });
  }
};

const logoff = (req, res) => {
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
    }
    res.redirect('/');
  });
};

const logonShow = (req, res) => {
  return req.user
    ? res.redirect('/')
    : res.render('logon', { csrfToken: req.csrfToken() });
};

// Function to connect a Parent to a Student
const connectChild = (req, res) => {
  if (req.user.role === 'parent') {
    res.render('connectStudent', { csrfToken: req.csrfToken() });
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
    const student = await User.findOne({
      email: studentEmail,
      role: 'student'
    });
    if (!student) {
      return res.status(404).send('Student not found');
    }
    // Update the Parent's childId to reference the Student's ID
    await User.findOneAndUpdate(
      { email: parentEmail, role: 'parent' },
      { childId: student._id }
    );

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
