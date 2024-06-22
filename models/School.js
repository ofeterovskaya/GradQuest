const mongoose = require('mongoose');

const SchoolSchema = new mongoose.Schema({
    schoolName: {
        type: String,
        required: [true, 'Please provide School name'],
        maxlength: 100, // Adjusted to allow for longer school names if necessary
    },
    testScores: {
        SAT: {
            type: Number,
            min: 400, // Assuming SAT scores range from 400 to 1600
            max: 1600,
            required: function() { return !this.testScores.ACT; } // Required if ACT is not provided
        },
        ACT: {
            type: Number,
            min: 1, // Assuming ACT scores range from 1 to 36
            max: 36,
            required: function() { return !this.testScores.SAT; } // Required if SAT is not provided
        }
    },
    gpa: {
        type: Number,
        required: [true, 'Please provide current GPA'],
        min: 0.0,
        max: 4.0 // Assuming a scale of 0.0 to 4.0 for GPA
    },
    activities: {
        type: [String], // Array of strings to list multiple activities
        default: []
    },
    volunteering: {
        type: [String], // Array of strings to list multiple volunteering experiences
        default: []
    },
    position: {
        type: [String], // Array of strings to list multiple positions held
        default: []
    },
    awards: {
        type: [String], // Array of strings to list multiple awards
        default: []
    },
    clubs: {
        type: [String], // Array of strings to list multiple clubs
        default: []
    },
    sport: {
        type: [String], // Array of strings to list multiple sports
        default: []
    },
    createdBy: {
        type: mongoose.Types.ObjectId, // CreatedBy should be a MongoDB ObjectId
        ref: 'User', // The ObjectId refers to a User document
        required: [true, 'Please provide a user']
    }
}, { timestamps: true }); // Enable timestamps

// Create a model from the schema and export it
module.exports = mongoose.model('School', SchoolSchema);