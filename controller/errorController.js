const AppError = require('../utils/appError');

const handlewtExpired = () =>
  new AppError('ypur token has expired . please log in again');
const jsonJwtError = () =>
  new AppError('invalid token . please log in again', 401);
// GLOBAL ERROR HANDLING MIDDLEWare
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // if (err.name === 'JsonWebTokenError') {
  //   err = jsonJwtError();
  // }
  // if (err.name === 'TokenExpiredError') {
  //   err = handlewtExpired();
  // }

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    statusCode: err.statusCode,
  });
};
