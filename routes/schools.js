const express = require("express");
const router = express.Router();
const School = require('../models/School');
const csrfProtection = require('../middleware/csrfProtection');
const auth = require('../middleware/auth');
const validateId = require("../middleware/validateId");
const {
    getNewSchool,  
    getSchools, 
    addSchools,
    editSchools,
    getEditSchool,
    updateSchools,
    deleteSchools,
    getSchoolList,
    displayStudentSchools            
} = require("../controllers/schoolController");

router.route("/new")
    .get(auth, csrfProtection, getNewSchool)
    .post(auth, csrfProtection, addSchools);

router.route("/")
    .get(auth, csrfProtection, getSchools) 
    .post(auth, csrfProtection, addSchools);

router.route("/edit/:id")
    .get(auth, csrfProtection, validateId, getEditSchool)
    .post(auth, csrfProtection, validateId, editSchools); 

router.route("/update/:id")
    .post(auth, csrfProtection, validateId, updateSchools); 

router.route("/delete/:id")
    .post(auth, csrfProtection, validateId, deleteSchools);

// Add the new route for /student-schools
router.route("/student-schools")
    .get(auth, csrfProtection, displayStudentSchools);

// Route to display the list of schools
router.route('/schools')
  .get(csrfProtection, getSchoolList)
  .post(auth, csrfProtection, (req, res) => {
    if (req.body.studentEmail) {
      // Logic for handling studentEmail
      res.redirect('/student-schools');
    } else {      
      getNewSchool(req, res);
    }
  });

  
module.exports = router;