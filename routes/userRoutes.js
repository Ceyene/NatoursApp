//dependencies
const express = require('express');
const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe
} = require('./../controllers/userController');
const {
  signUp,
  logIn,
  forgotPassword,
  resetPassword,
  protect,
  restrictTo,
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
router.patch('/updateMe', protect, updateMe); //updateMe is a special endpoint
router.delete('/deleteMe', protect, deleteMe); //deleteMe is a special endpoint

router
  .route('/')
  .get(getAllUsers)
  .post(createUser);
router
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(protect, restrictTo('admin'), deleteUser);

module.exports = router;
