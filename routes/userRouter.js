const express = require('express');

const userHandler = require('./../controller/userController');
const authHandler = require('./../controller/authController');

const Router = express.Router();

Router.route('/login').post(authHandler.Login);
Router.route('/signup').post(authHandler.signUp);

Router.route('/resetPassword/:token').patch(authHandler.reset);
Router.route('/forgetPassword').post(authHandler.forgetPassword);

Router.route('/updatePassword').patch(
  authHandler.protect,
  authHandler.updatePassword,
);
Router.route('/updateMe').patch(authHandler.protect, userHandler.updateMe);
Router.route('/deleteMe').delete(authHandler.protect, userHandler.deleteME);

Router.route('/').get(userHandler.getAllUsers);

Router.route('/:id')
  .get(userHandler.getUsers)
  .patch(userHandler.updateUsers)
  .delete(userHandler.deleteUsers);

module.exports = Router;
