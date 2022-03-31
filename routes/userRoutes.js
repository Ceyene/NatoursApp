//dependencies
const express = require('express');
const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  getMe,
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

router.get('/me', protect, getMe, getUser); //getMe is a special endpoint
router.patch('/updateMe', protect, updateMe); //updateMe is a special endpoint
router.delete('/deleteMe', protect, deleteMe); //deleteMe is a special endpoint

router
  .route('/')
  .get(getAllUsers)
  .post(createUser);
router
  .route('/:id')
  .get(getUser)
  .patch(protect, restrictTo('admin'), updateUser) //admin use only
  .delete(protect, restrictTo('admin'), deleteUser); //admin use only

module.exports = router;
