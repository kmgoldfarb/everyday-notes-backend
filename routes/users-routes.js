const express = require('express');
const auth = require('../middleware/auth');
const usersController = require('../controllers/users-controller');
const decodeToken = require('../middleware/firebase-auth');

const router = express.Router();

//Sign up user
router.post('/signup', usersController.signUpUser);

//Login user
router.post('/login', usersController.loginUser);

//Protect routes below middleware
router.use(decodeToken);

//See user homepage
router.get('/:uid', usersController.getNotesByUser);

//Change password
router.patch('/change-password', usersController.changePassword);

module.exports = router;
