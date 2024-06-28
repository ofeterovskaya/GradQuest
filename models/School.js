const mongoose = require('mongoose');

const SchoolSchema = new mongoose.Schema(
  {
    schoolName: {
      type: String,
      required: [true, 'Please provide School name'],
      maxlength: 100
    },
    testScores: {
      SAT: {
        type: Number,
        min: 0,
        max: 1600,
        required: function () {
          return !this.testScores.ACT;
        } // Required if ACT is not provided
      },
      ACT: {
        type: Number,
        min: 0,
        max: 36,
        required: function () {
          return !this.testScores.SAT;
        } // Required if SAT is not provided
      }
    },
    gpa: {
      type: Number,
      required: [true, 'Please provide current GPA'],
      min: 0.0,
      max: 5.0
    },
    activities: {
      type: [String],
      default: []
    },
    volunteering: {
      type: [String],
      default: []
    },
    position: {
      type: [String],
      default: []
    },
    awards: {
      type: [String],
      default: []
    },
    clubs: {
      type: [String],
      default: []
    },
    sport: {
      type: [String],
      default: []
    },
    createdBy: {
      type: mongoose.Types.ObjectId, // CreatedBy should be a MongoDB ObjectId
      ref: 'User', // The ObjectId refers to a User document
      required: [true, 'Please provide a user']
    },
    schoolCreationDate: {
      type: Date,
      default: Date.now // Automatically sets to the current date/time when a new document is created
    }
  },
  { timestamps: true }
); // Enable timestamps
// Create a model from the schema and export it
module.exports = mongoose.model('School', SchoolSchema);
