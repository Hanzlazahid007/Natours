const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, 'enter a string'],
      unique: true, // This field must be unique
      minlength: [10, 'its must be greater than 10'],
      maxlength: [40, 'its must be less than 10'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    difficulty: {
      type: String,
      trim: true,
      required: [true, 'a tour must have a difficilyy'],
      enum: {
        values: ['easy', 'medium', 'difficulty'],
      },
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'a tour have group'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [10, 'its must be greater than 10'],
      max: [10, 'its must be less than 10'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      require: [true, 'a tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      // this only point to current documents on new document creation
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'price discount must be less than price',
      },
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    imageCover: {
      type: String,
      trim: true,
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    startLocation: {
      type: {
        type: String,
        default: 'point',
        enum: ['point'],
      },
      cordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'point',
          enum: ['point'],
        },
        cordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// DOCUMENT MIDDLEWARE run before .save() and .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Query MiddleWAre
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});
tourSchema.post(/^find/, function (docs, next) {
  console.log(docs);
  next();
});

// Aggregation middleware
tourSchema.pre('aggregation', function (next) {
  this.aggregation().pipeline.unshift({ $match: { $ne: true } });
  next();
});
Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
