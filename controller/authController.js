const User = require('./../model/userModel');
const crypto = require('crypto');
const { promisify } = require('util');

const jwt = require('jsonwebtoken');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

const createReseetToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOption = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  // console.log(process.env.JWT_COOOKIE_EXPIRES_IN);
  if (process.env.NODE_ENV === 'production ') cookieOption.secure = true;

  res.cookie('jtw', token, cookieOption);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: user,
  });
};

const signToken = (id) => {
  return jwt.sign({ id }, 'asssssssss', {
    expiresIn: '90d',
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    changePasswordAt: req.body.changePasswordAt,
    role: req.body.role,
  });

  createReseetToken(newUser, 200, res);
});

exports.Login = async (req, res, next) => {
  const { email, password } = req.body;

  // 1) check email and password exist
  if (!email || !password) {
    next(new AppError('please provide email and pass ', 400));
  }
  // 2) check user exist and password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('incorrect email or password', 401));
  }
  // 3) if everything is ok . send token to the client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  console.log(token);
  if (!token) {
    next(new AppError('please log in', 401));
  }
  // 2) verify token
  // promisify will return promise
  const decode = await promisify(jwt.verify)(token, 'asssssssss');
  console.log(decode);

  // most tutorial stop there  but it is not to secure
  // ==========================================================================

  // 3) NOW CHECK USER STILL EXIST
  const currentUser = await User.findById(decode.id);
  // console.log(currentUser);
  if (!currentUser) {
    return next(new AppError("User doesn't exist.", 401));
  }
  // 4) Password change or not
  if (currentUser.changePasswordAfter(decode.iat)) {
    return next(new AppError('User has recently changed the password', 401));
  }
  req.user = currentUser;
  next();
});

exports.restrict = (...role) => {
  return (req, res, next) => {
    if (!role.includes(req.body.role)) {
      next(new AppError('you can not do this', 403));
    }
    next();
  };
};

exports.forgetPassword = async (req, res, next) => {
  try {
    // 1) get user based on posted email
    console.log(req.body);

    // GET USER
    const user = await User.findOne({ email: req.body.email });
    console.log(user);
    if (!user) {
      return next(new AppError('No User exist with this email', 403));
    }

    // Generate Token
    // This is instance method available on all documents created in userModel file
    const resetToken = user.createTokenResetPassword();
    console.log(resetToken);
    await user.save();
    res.status(200).json({ message: 'Done!' });

    // 3) send the reset token to the user's email (implementation needed)
    // const resetURL = ` ${req.protocol}://${req.get(
    //   'host',
    // )}/api/v1/users/resetPassword/${resetToken}`;

    // const message = `forgor ypur password submit a patch request with your new password and password confirm to : ${resetURL}.\n if you didn't forget password , please ignore this email: `;
    // try {
    //   await sendEmail({
    //     email: user.email,
    //     subject: 'your password reset token ',
    //     message,
    //   });
    //   res.status(200).json({
    //     status: 'success',
    //     message: 'Token send to email',
    //   });
    // } catch (err) {
    //   user.passwordResetToken = undefined;
    //   user.passwordResetExpire = undefined;
    //   await user.save({ validateBeforeSave: false });

    //   return next(
    //     new AppError(
    //       'there was an error sending the email . try again laiter',
    //       500,
    //     ),
    //   );
    // }
  } catch (err) {
    res.status(400).json({
      status: 'fail',
    });
  }
};

exports.reset = async (req, res, next) => {
  // 1) get user based on the token
  const hashToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetExpire: { $gt: Date.now() },
  });

  // 2) if token is not expired  , and there is user , set the new password
  if (!user) {
    return next(new AppError('the token is invalid or expired ', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;
  await user.save();

  // 3) update changePasswordAt property for user

  // 4) log the user in send JWT
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
};

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  console.log(user);

  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('the current password is incorrect', 401));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.passwordConfirm;
  await user.save();

  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

// ======================================================================================
