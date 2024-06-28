const mongoose = require('mongoose');
const School = require('../models/School');
const handleErrors = require("../utils/parseValidationErrs");
//const User = require('../models/User');

// GET a form for adding a new school
const getNewSchool = (req, res) => {    
    res.render('newSchool', { school: null, csrfToken: req.csrfToken() });
};

// GET all Schools for the current user
const getSchools = async (req, res) => {
    let { page, limit, order, sort } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 6;
    let query;

    // Check if the user is a parent or a student
    if (req.user.role === 'parent') {
        // If the user is a parent, use the childId to find schools
        query = { createdBy: req.user.childId };
    } else {
        // If the user is a student, use the student's _id to find schools
        query = { createdBy: req.user._id };
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    try {
        const schools = await School.find(query)
                                    .sort({ [sort]: sortOrder })
                                    .skip((page - 1) * limit)
                                    .limit(limit);
        const total = await School.countDocuments(query);
        const pages = Math.ceil(total / limit);
        const nextOrder = order === 'asc' ? 'desc' : 'asc';

        res.render('schoolList', {
            schools,
            total,
            pages,
            current: page,
            sortField: sort,
            sortOrder: nextOrder,
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
        //check if the user is a parent or a student       
        //check if parent has childID if childId exicts
        if(req.user.role ==='parent' && !req.user.childId ){
            throw new Error('Parent does not have a childId');
        }
        //throw error if childId does not exist
       
        const schoolData = {
            schoolName,
            gpa: gpaScore,
            act:actScore,
            testScores,
            volunteering,
            awards,
            clubs,
            sport,
            createdBy:  req.user.childId || req.user._id};

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
            // Directly pass the school object as it includes testScores and gpa
            res.render('editForm', { 
                school: school, // This includes testScores (SAT, ACT) and gpa
                csrfToken: req.csrfToken() 
            });
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
// Show add new school form for parent
const addSchoolForm = (req, res) => {
    if (req.user.role === 'parent') {       
        res.render('addSchool', { school: null, csrfToken: req.csrfToken() });
    } else {
        res.redirect('/schools');
    }
};

module.exports = {
  getNewSchool,  
  getSchools,  
  addSchools,
  editSchools,
  getEditSchool,
  updateSchools,
  deleteSchools,  
  addSchoolForm,  
};