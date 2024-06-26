const mongoose = require('mongoose');
const School = require('../models/School');
const handleErrors = require("../utils/parseValidationErrs");
const User = require('../models/User');

// GET a form for adding a new school
const getNewSchool = (req, res) => {
    res.render('newSchool', { school: null, csrfToken: req.csrfToken() });
};

// GET all Schools for the current user
const getSchools = async (req, res) => {
    let { page, limit, order, sort } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 6;
    const query = { createdBy: req.user._id };

    // Toggle sortOrder based on the current request
    const sortOrder = order === 'desc' ? -1 : 1;
    try {
        const schools = await School.find(query)
                                    .sort({ [sort]: sortOrder })
                                    .skip((page - 1) * limit)
                                    .limit(limit);
        const total = await School.countDocuments(query);
        const pages = Math.ceil(total / limit);

        // Determine the next sortOrder for the frontend link
        const nextOrder = order === 'asc' ? 'desc' : 'asc';
        res.render('schoolList', {
            schools,
            total,
            pages,
            current: page,
            sortField: sort,
            sortOrder: nextOrder, // Pass the nextOrder for the frontend to use
            csrfToken: req.csrfToken()
        });
    } catch (error) {
        handleErrors(error, req, res);
        console.error('Error fetching schools:', error.message);
        console.error(error.stack);
        res.status(500).send('An error occurred while fetching schools');
    }
};
// POST a new school
const addSchools = async (req, res, next) => {
    console.log(req.body); // Log the request body to ensure it's as expected
    const { schoolName, gpaScore, actScore, satActScore, scoreType,volunteering, awards, clubs, sport, createdBy } = req.body;

    // Validate GPA
    const gpa = parseFloat(gpaScore);
    if (isNaN(gpa) || gpa > 5) {
        return res.status(400).send("Invalid GPA. Maximum allowed value is 5.0.");
    }
    // Validate SAT/ACT score
    const score = parseInt(satActScore);
    if (isNaN(score)) {
        return res.status(400).send("Invalid SAT/ACT score.");
    }
    // Determine if the score is SAT or ACT based on its value
    let testScores;
    if (scoreType === "SAT") {
        testScores = { SAT: score };
    } else if (scoreType === "ACT") {
        testScores = { ACT: score };
    } else {
        return res.status(400).send("Score type must be either SAT or ACT.");
    }
    try {
        const schoolData = {
            schoolName,
            gpa: gpaScore,
            act:actScore,
            testScores,
            volunteering,
            awards,
            clubs,
            sport,
            createdBy: req.user._id
        };
        await School.create(schoolData);
        console.log("School successfully added");
        res.redirect('/schools');
    } catch (error) {
        console.error("Error adding school:", error);
        res.status(500).send("An error occurred while adding the school.");
    }
};
// Edit a school
const editSchools = async (req, res) => {
    const id = req.params.id; // Get school ID from URL parameters
    const updatedSchoolData = req.body; // Get updated school data from request body
    try {        
        await School.updateOne({ _id: id }, updatedSchoolData); // Update the school with new data
        const school = await School.findById(req.params.id); // Fetch the updated school details
        res.render('school', { school: school, csrfToken: req.csrfToken() });
        res.redirect(`/schools/${id}`);
    } catch (error) {       
        console.error(error);
        res.status(500).send('An error occurred');
    }
};

// GET a specific school for editing
const getEditSchool = async (req, res) => {
    try {
        const school = await School.findById(req.params.id);
        if (school) {
            res.render('editForm', { school: school, csrfToken: req.csrfToken() });
        } else {
            throw new Error('School not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while fetching the school');
    }
};

// POST an updated school
const updateSchools = async (req, res, next) => {
    try {
        const updatedSchool = await School.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedSchool) {
            res.status(404);
            req.flash('error', 'School not found');
            return;
        }
        res.redirect('/schools');
    } catch (error) {
        handleErrors(error, req, res, '/schools/edit/' + req.params.id);
    }
};

// POST to delete a school
const deleteSchools = async (req, res, next) => {
    try {
        const deletedSchool = await School.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
        if (!deletedSchool) {
            res.status(404);
            req.flash('error', 'School not found');
            return res.redirect('/schools'); 
        }
        req.flash('success', 'School was deleted');
        res.redirect('/schools');
    } catch (error) {
        handleErrors(error, req, res, '/schools');
    }
};

// Function to fetch and render schools for a specific student or parent's child
const getSchoolList = async (req, res) => {
    try {
      let userId = req.session.userId;
      const user = await User.findById(userId);
      let studentId = req.query.studentId;
      // Additional logging for debugging
      console.log('User details:', user);
      console.log('Initial studentId from query:', studentId);
  
      // If the user is a Parent and no studentId is provided in the query, use the parent's childId
      if (user.role === 'parent' && !studentId) {
        studentId = user.childId;
      }
  
      // Log the final studentId used for the query
      console.log('Fetching schools for studentId:', studentId);
  
      // Ensure studentId is available, after attempting to set it from user.childId
      if (!studentId) {
        console.log('No studentId provided');
        return res.status(400).send('Student ID is required');
      }
  
      const schools = await School.find({ studentId: studentId });
      res.render('schoolList', { schools }); // Render school list
    } catch (error) {
      console.error('Failed to fetch school list:', error);
      res.status(500).send('An error occurred');
    }
  };
const handleSchoolPost = async (req, res) => {
    if (req.body.studentEmail) {
      try {
        const student = await User.findOne({ email: req.body.studentEmail, role: 'student' });
        if (student) {
            console.log('Student found:', student);
            res.redirect(`/schools?studentId=${student._id}`);
        } else {
          res.status(404).send('Student not found');
        }
      } catch (error) {
        console.error('Failed to find student:', error);
        res.status(500).send('Internal Server Error');
      }
    } else {
      getNewSchool(req, res);
    }
};
// // Function to display schools associated with a student's email
// const displayStudentSchools = async (req, res) => {
//     try {
//       const studentEmail = req.session.studentEmail;
//       // Logic to fetch schools associated with studentEmail
//       const schools = await findSchoolsByStudentEmail(studentEmail);
//       res.render('studentSchools', { schools });
//     } catch (error) {
//       console.error('Error fetching schools:', error);
//       res.status(500).send('Server error');
//     }
//   };


module.exports = {
  getNewSchool,  
  getSchools,  
  addSchools,
  editSchools,
  getEditSchool,
  updateSchools,
  deleteSchools,
  getSchoolList,
  handleSchoolPost,
  //displayStudentSchools
};