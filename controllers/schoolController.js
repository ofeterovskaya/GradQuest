const mongoose = require('mongoose');
const School = require('../models/School');
const handleErrors = require("../utils/parseValidationErrs");
const csrfProtection = require("../middleware/csrfProtection");
const newSchool = require('../controllers/schoolController');

// GET a form for adding a new school
const getNewSchool = (req, res) => {
    res.render('newSchool', { school: null, csrfToken: req.csrfToken() });
};

// GET all Schools for the current user
const getSchools = async (req, res, next) => {
    try {
        const schools = await School.find({ createdBy: req.user._id });   
        console.log(schools); // line to log the fetched data    
        res.render('schoolList', { schools: schools, csrfToken: req.csrfToken() });
    } catch (error) {
        handleErrors(error, req, res);
        console.error('Error fetching schools:', error.message);
        console.error(error.stack); // Log the stack trace
        res.status(500).send('An error occurred while fetching schools');
    }
};

// // POST a new School
// const addSchools = async (req, res, next) => {
//     try {
//         await School.create({ ...req.body, createdBy: req.user._id });
//         res.redirect('/schools'); 
//     } catch (error) {
//         handleErrors(error, req, res);
//     }
// };

// Simplified addSchools for debugging
const addSchools = async (req, res, next) => {
    console.log(req.body); // Log the request body to ensure it's as expected
    const { schoolName, gpaScore, satActScore, awards, clubs, sport, createdBy } = req.body;

    // Validate GPA
    const gpa = parseFloat(gpaScore);
    if (isNaN(gpa) || gpa > 5) {
        return res.status(400).send("Invalid GPA. Maximum allowed value is 5.0.");
    }

    // Assuming a simple conversion for SAT to ACT (for demonstration purposes)
    const satToAct = (sat) => Math.min(36, Math.round(sat / 80)); // Example conversion
    let actScore = parseInt(satActScore);
    if (isNaN(actScore)) {
        return res.status(400).send("Invalid SAT/ACT score.");
    }
    // Convert SAT to ACT if necessary (assuming SAT scores are higher than 36)
    if (actScore > 36) {
        actScore = satToAct(actScore);
    }

    try {
        const schoolData = {
            ...req.body,
            gpa: gpaScore,
            testScores: {
                SAT: satActScore,
                ACT: actScore.toString() // Ensure ACT score is within valid range
            },
            createdBy: req.user._id
        };
        await School.create(schoolData);
        console.log("School successfully added");
        res.redirect('/schools'); 
    } catch (error) {
        console.error(error); // Ensure errors are logged
        res.status(500).send("An error occurred");
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

module.exports = {
  getNewSchool,  
  getSchools,  
  addSchools,
  editSchools,
  getEditSchool,
  updateSchools,
  deleteSchools
};