const express = require("express");
const router = express.Router();
const Job = require('../models/Job');

const {
    getJobs,
    addJobs,
    getNewJobs,
    editJobs,
    updateJobs,
    deleteJobs,
} = require("../controllers/jobs.js");

router.get('/jobs', async function(req, res) {
    try {
        // Fetch jobs from the database...
        let jobs = await Job.find(); 
        res.render('jobs', { jobs: jobs, _csrf: req.csrfToken() });
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while fetching jobs');
    }
});

router.route("/jobs/delete/:id")
    .post(async function(req, res) {
        try {
            await Job.findByIdAndRemove(req.params.id);
            res.redirect('/jobs');
        } catch (error) {
            console.error(error);
            res.status(500).send('An error occurred while deleting the job');
        }
    });

router.route("/jobs/new")
    .get(getNewJobs)
    .post(getNewJobs); 

router.route("/jobs/edit/:id")
    .get(editJobs)
    .post(editJobs); 

router.route("/jobs/update/:id")
    .post(updateJobs); 

router.route("/jobs")
    .get(getJobs)
    .post(addJobs);

module.exports = router;