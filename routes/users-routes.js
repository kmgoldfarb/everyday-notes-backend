const express = require('express');
const auth = require('../middleware/auth');
const usersController = require('../controllers/users-controller');

const router = express.Router();

//Sign up user
router.post('/signup', usersController.signUpUser);

//Login user
router.post('/login', usersController.loginUser);

//Protect routes below middleware
router.use(auth);

//See user homepage
router.get('/:uid', usersController.getNotesByUser);

//Change password
router.patch('/change-password', usersController.changePassword);

module.exports = router;
