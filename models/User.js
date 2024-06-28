const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
//const jwt = require('jsonwebtoken');

// Define the User schema
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email'
    ],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'parent', 'counselor'], // Include all roles here
    required: true
  },
  childId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Only required for Parent role, handle this logic in your application code
  }
});
// Before saving the user, hash the password
UserSchema.pre('save', async function () {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

//compare the provided password with the user's password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};
module.exports = mongoose.model('User', UserSchema);
