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
  deleteMe,
  uploadUserPhoto,
  resizeUserPhoto
} = require('./../controllers/userController');
const {
  signUp,
  logIn,
  logOut,
  forgotPassword,
  resetPassword,
  protect,
  restrictTo,
  updatePassword
} = require('./../controllers/authController');

//USERS ROUTER
const router = express.Router();

//ROUTES
//public routes
router.post('/signup', signUp);
router.post('/login', logIn);
router.get('/logout', logOut);

//authenticating user in order to use any of the following routes
router.use(protect);

//authenticated user routes
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
router.patch('/updateMyPassword', updatePassword);

router.get('/me', getMe, getUser);
router.patch('/updateMe', uploadUserPhoto, resizeUserPhoto, updateMe); //updating user's photo and/or data
router.delete('/deleteMe', deleteMe);

//restricting the following routes to non admin users
router.use(restrictTo('admin'));

//admin only routes
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
