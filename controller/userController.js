const User = require('./../model/userModel');
const AppError = require('./../utils/appError');
const CatchAsync = require('./../utils/catchAsync');

exports.getAllUsers = async (req, res) => {
  const user = await User.find();
  res.status(200).json({
    status: 'success',
    result: user.length,
    data: {
      users: user,
    },
  });
};

const filterObj = (obj, ...allowFilled) => {
  const newObj = {};

  Object.keys(obj).forEach((el) => {
    if (allowFilled.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};
exports.deleteME = async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'succes',
    data: null,
  });
};

exports.updateMe = async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('this route is not for update password', 400));
  }
  const filterData = filterObj(req.body, 'name', 'email');
  const updateUser = await User.findByIdAndUpdate(req.user.id, filterData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: updateUser,
  });
};

exports.getUsers = (req, res) => {
  res.status(500).json({
    result: 'success',
    error: 'the routes is not defined yet',
  });
};

exports.createUsers = (req, res) => {
  res.status(500).json({
    result: 'success',
    error: 'the routes is not defined yet',
  });
};
exports.updateUsers = (req, res) => {
  res.status(500).json({
    result: 'success',
    error: 'the routes is not defined yet',
  });
};
exports.deleteUsers = (req, res) => {
  res.status(500).json({
    result: 'success',
    error: 'the routes is not defined yet',
  });
};
