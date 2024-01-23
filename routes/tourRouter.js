const express = require('express');
const app = express();
const tourHandler = require('./../controller/tourController');
const authController = require('./../controller/authController');
// // console.log(tourHandler);
// // ===========================================================================================

const Router = express.Router();

Router.route('/top-5-cheaps').get(tourHandler.alias, tourHandler.getAllTour);

Router.route('/tour-state').get(tourHandler.getTourState);

Router.route('/tour-month-plan/:year').get(tourHandler.getMonthPlan);

Router.route('/Login').post(authController.Login);

Router.route('/')
  .get(authController.protect, tourHandler.getAllTour)
  .post(tourHandler.createTour);

Router.route('/:id')
  .get(tourHandler.getTour)
  .patch(tourHandler.updateTour)
  .delete(
    authController.protect,
    authController.restrict('admin', 'lead-guide'),
    tourHandler.deleteTour,
  );

module.exports = Router;
