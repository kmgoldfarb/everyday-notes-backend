require('dotenv').config();
const User = require('../models/user');
const Note = require('../models/note');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const admin = require('firebase-admin');

const getNotesByUser = async (req, res, next) => {
  const auth = req.currentUser;
  const reqUid = auth.uid;
  let notes;
  try {
    notes = await Note.find({ creator: reqUid });
  } catch (err) {
    return next(err);
  }
  const sortedNotes = notes.sort((a, b) => b.date - a.date);
  res.json({
    notes: sortedNotes.map((note) => note.toObject({ getters: true })),
  });
};

const signUpUser = async (req, res, next) => {
  const { email, uid } = req.body;
  if (!email) {
    return res.json({ status: 'error', error: 'Invalid email.' });
  }
  if (!uid) {
    return res.json({ status: 'error', error: 'User ID invalid' });
  }
  const createdUser = new User({
    email: email,
    uid: uid,
    notes: [],
  });
  try {
    await createdUser.save();
  } catch {
    return res.json({ status: 'error', error: 'Creating user failed.' });
  }
  res.status(201).json({ userId: createdUser.uid });
};

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.json({
      status: 'error',
      error: 'Invalid username or password.',
    });
  }
  let verification;
  try {
    verification = await bcrypt.compare(password, user.password);
  } catch (err) {
    return res.json({
      status: 'error',
      message: 'Invalid credentials. Try logging in again.',
    });
  }
  if (!verification) {
    return res.json({
      status: 'error',
      message: 'Invalid credentials. Try logging in again.',
    });
  }
  let token;
  try {
    token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
  } catch {
    throw new Error('Logging in failed.');
  }
  let firebaseUser;
  signInWithCustomToken(auth, token)
    .then((userCred) => {
      firebaseUser = userCred.user;
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
    });
  return res.json({ userId: user.id, token: token });
};

const changePassword = async (req, res, next) => {
  const { token, newpassword } = req.body;
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    console.log(user);
    const userId = user.userId;
    const updatedPassword = await bcrypt.hash(newpassword, 10);
    const updatedUser = await User.findByIdAndUpdate(
      { _id: userId },
      { password: updatedPassword }
    );
    return res.json({ status: 'ok', message: 'Password has been changed.' });
  } catch (error) {
    console.log(error);
    return res.json({ status: 'error', error: 'Error has occurred.' });
  }
};

exports.signUpUser = signUpUser;
exports.loginUser = loginUser;
exports.changePassword = changePassword;
exports.getNotesByUser = getNotesByUser;
