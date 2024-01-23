const express = require('express');
const helmet = require('helmet');
const mongoSantize = require('express-mongo-sanitize');
const hpp = require('hpp');
const xss = require('xss-clean');
const app = express();
const AppError = require('./utils/appError');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const globalErrorHadler = require('./controller/errorController');
const rateLimit = require('express-rate-limit');

// 1) middleware
app.use(morgan('dev'));

app.use(helmet());

// body parser reading daa from body into req.body

app.use(express.json({ limit: '10kb' }));

//Data sanitization against no SQLquery injection
app.use(mongoSantize());
//Data sanitization against XSS
app.use(xss());

// prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'price',
      'difficulty',
      'maxGroupSize',
    ],
  }),
);

//serving static files
app.use(express.static(`${__dirname}/public`));

const limit = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 100,
  message: 'to many request . please try again after 1 hour',
});
app.use('/app', limit);

// 2) ROUTES
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`cant find ${req.url} please enter valid url `, 404));
});

// GLOBAL ERROR HANDLING MIDDLEWare
app.use(globalErrorHadler);

module.exports = app;
