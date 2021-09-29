require("dotenv").config();
const User = require("../models/user");
const Note = require("../models/note");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const getNotesByUser = async (req, res, next) => {
  const userId = req.params.uid;
  let notes;
  try {
    notes = await Note.find({ creator: userId });
  } catch (err) {
    return next(err);
  }
  const sortedNotes = notes.sort((a, b) => b.date - a.date);
  res.json({
    notes: sortedNotes.map((note) => note.toObject({ getters: true })),
  });
};

const signUpUser = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email) {
    return res.json({ status: "error", error: "Invalid email." });
  }
  if (!password || typeof password !== "string") {
    return res.json({ status: "error", error: "Invalid password." });
  }
  if (password.length < 6) {
    return res.json({
      status: "error",
      error: "Password must be at least 6 characters long.",
    });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const createdUser = new User({
    email,
    password: hashedPassword,
    notes: [],
  });
  try {
    await createdUser.save();
  } catch {
    return res.json({ status: "error", error: "Creating user failed." });
  }

  let token;
  try {
    token = jwt.sign({ userId: createdUser.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
  } catch {
    throw new Error("Signing up failed.");
  }
  res.status(201).json({ userId: createdUser.id, token: token });
};

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.json({
      status: "error",
      error: "Invalid username or password.",
    });
  }
  let verification;
  try {
    verification = await bcrypt.compare(password, user.password);
  } catch (err) {
    return res.json({
      status: "error",
      message: "Invalid credentials. Try logging in again.",
    });
  }
  if (!verification) {
    return res.json({
      status: "error",
      message: "Invalid credentials. Try logging in again.",
    });
  }
  let token;
  try {
    token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
  } catch {
    throw new Error("Logging in failed.");
  }
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
    return res.json({ status: "ok", message: "Password has been changed." });
  } catch (error) {
    console.log(error);
    return res.json({ status: "error", error: "Error has occurred." });
  }
};

exports.signUpUser = signUpUser;
exports.loginUser = loginUser;
exports.changePassword = changePassword;
exports.getNotesByUser = getNotesByUser;
