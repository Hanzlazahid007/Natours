const mongoose = require('mongoose');
// Crypto for creating reset token
const crypto = require('crypto');
// validator 3rd party package for validation
const validator = require('validator');
// Encryption
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, 'please Enter a name'],
  },
  email: {
    type: String,
    require: [true, 'please ENter a email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'invalid email'],
  },
  photos: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please add a Password'],
    minlength: 8,
    // not shown at all
    select: false,
  },
  passwordConfirm: {
    type: String,
    require: [true, 'please confirm your password'],
    // THis only work on create and save
    validate: {
      validator: function (el) {
        return el === this.password; // confirmpassword === password
      },
      message: 'password are not the same',
    },
  },
  changePassordAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// userSchema.pre('save', function (next) {
//   if (!this.isModified('password') || this.isNew()) return next();
//   this.changePassordAt = Date.now() - 1000;
//   next();
// });
userSchema.pre('save', function (next) {
  // if (this.isModefied('password')) return next();
  this.password = bcrypt.hashSync(this.password, 10);
  this.passwordConfirm = undefined;
  next();
});
userSchema.methods.correctPassword = function (cpassword, upassowrd) {
  return bcrypt.compare(cpassword, upassowrd);
};

userSchema.methods.changePasswordAfter = function (jwttimestamp) {
  if (this.changePassordAt) {
    // console.log(this.changePassordAt, jwttimestamp);
    const changeTimeStamp = parseInt(this.changePassordAt.getTime() / 1000, 10);
    // console.log(changeTimeStamp, jwttimestamp);
    return jwttimestamp < changeTimeStamp;
  }
  false;
};
userSchema.methods.createTokenResetPassword = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Token stored in DB in hashed form
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  // in 10min it wil expire
  // this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  console.log(typeof this.passwordResetToken);

  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
