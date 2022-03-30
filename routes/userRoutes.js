//dependencies
const express = require('express');
const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser
} = require('./../controllers/userController');
const {
  signUp,
  logIn,
  forgotPassword,
  resetPassword,
  protect,
  updatePassword
} = require('./../controllers/authController');

//USERS ROUTER
const router = express.Router();

//ROUTES
//users routes
router.post('/signup', signUp); //signup is a special endpoint
router.post('/login', logIn); //login is a special endpoint

router.post('/forgotPassword', forgotPassword); //forgotPassword is a special endpoint
router.patch('/resetPassword/:token', resetPassword); //resetPassword is a special endpoint

router.patch('/updateMyPassword', protect, updatePassword); //updateMyPassword is a special endpoint

router
  .route('/')
  .get(getAllUsers)
  .post(createUser);
router
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

module.exports = router;
