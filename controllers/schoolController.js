const mongoose = require('mongoose');
const School = require('../models/School');
const handleErrors = require("../utils/parseValidationErrs");
const csrfProtection = require("../middleware/csrfProtection");

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

// POST a new School
const addSchools = async (req, res, next) => {
    try {
        await School.create({ ...req.body, createdBy: req.user._id });
        res.redirect('/schools'); 
    } catch (error) {
        handleErrors(error, req, res);
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