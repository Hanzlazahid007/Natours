const Tour = require('./../model/tourmodel');

const syncError = require('./../utils/catchAsync');
exports.alias = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields =
    'name,summary,duration,maxGroupSize,difficulty, ratingsQuantity, price';
  next();
};

exports.getAllTour = async (req, res) => {
  // 1A) filtering
  const queryObj = { ...req.query };

  // 1B) Advance Filtering
  let queryString = JSON.stringify(queryObj);
  queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, (el) => `$${el}`);
  var query = Tour.find(JSON.parse(queryString));

  // 2) SORTING
  if (req.query.sort) {
    const sortBY = req.query.sort.split(',').join(' ');
    query = query.sort(sortBY);
  } else {
    query = query.sort('-createdAt');
  }

  // 3) Limited Fields
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  } else {
    query = query.select('-__v');
  }

  // 4) Pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;
  const skip = (page - 1) * limit;
  query = query.skip(skip).limit(limit);
  if (req.query.page) {
    const count = await Tour.countDocuments();
    if (skip >= count) throw Error('wqwqwqw');
  }

  // Execution Query
  const tour = await query;

  res.status(200).json({
    status: 'success',
    result: tour.length,
    data: {
      tours: tour,
    },
  });
};

exports.getTour = async (req, res) => {
  const tour = await Tour.findById(req.params.id);
  console.log(tour);

  res.status(200).json({
    status: 'success',
    // result: tours.length,
    data: {
      tour: tour,
    },
  });
};

exports.createTour = syncError(async (req, res) => {
  // try {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tours: newTour,
    },
  });
});
exports.updateTour = async (req, res) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true, //these two fields are optional
    runValidators: true,
  });
  // console.log(update);
  res.status(200).json({
    status: 'success',
    data: {
      tour: tour,
    },
  });
};
exports.deleteTour = async (req, res) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  res.status(200).json({
    status: 'success',
    data: null,
  });
};

exports.getTourState = async (req, res) => {
  // try {
  const sta = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$difficulty',
        numTour: { $sum: 1 },
        numRating: { $sum: '$ratingsQuantity' },
        averageRating: { $avg: '$ratingsAverage' },
        averagePrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { averagePrice: 1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      tour: sta,
    },
  });
  // } catch (err) {
  //   res.status(400).json({
  //     status: 'fail',
  //     message: sta,
  //   });
  // }
};

exports.getMonthPlan = async (req, res) => {
  // try {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}- 01 - 01 `),
          $lte: new Date(`${year} - 12 - 31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        newTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      tour: plan,
    },
  });
  // } catch (err) {
  //   res.status(400).json({
  //     status: 'fail',
  //     message: err,
  //   });
  // }
};
