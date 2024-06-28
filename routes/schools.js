const express = require('express');
const router = express.Router();
const csrfProtection = require('../middleware/csrfProtection');
const auth = require('../middleware/auth');
const validateId = require('../middleware/validateId');
const {
  getNewSchool,
  getSchools,
  addSchools,
  editSchools,
  getEditSchool,
  updateSchools,
  deleteSchools
  //addSchoolForm
} = require('../controllers/schoolController');

router
  .route('/new')
  .get(auth, csrfProtection, getNewSchool)
  .post(auth, csrfProtection, addSchools);

router
  .route('/')
  .get(auth, csrfProtection, getSchools)
  .post(auth, csrfProtection, addSchools);

router
  .route('/edit/:id')
  .get(auth, csrfProtection, validateId, getEditSchool)
  .post(auth, csrfProtection, validateId, editSchools);

router
  .route('/update/:id')
  .post(auth, csrfProtection, validateId, updateSchools);

router
  .route('/delete/:id')
  .post(auth, csrfProtection, validateId, deleteSchools);

// router.route("/addSchool")
//     .get(auth, csrfProtection, addSchoolForm);

module.exports = router;
