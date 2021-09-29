const mongoose = require("mongoose");
const User = require("../models/user");
const Note = require("../models/note");

const getNoteByNoteId = async (req, res, next) => {
  const noteId = req.params.nid;
  let note;
  try {
    note = await Note.findById(noteId);
  } catch (err) {
    console.log(err);
  }
  res.json({ note: note });
};

const createNote = async (req, res, next) => {
  const { date, action, gratitude, journal, image, mood, creator } = req.body;
  let createdNote;
  if (req.file) {
    createdNote = new Note({
      date,
      action,
      gratitude,
      journal,
      mood,
      image: req.file.path,
      creator,
    });
  } else {
    createdNote = new Note({
      date,
      action,
      gratitude,
      journal,
      mood,
      creator,
    });
  }
  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    res.status(404).json({
      message: "Could not find user for provided ID.",
    });
    return;
  }

  if (!user) {
    res.status(404).json({
      message: "Could not find user for provided ID.",
    });
    return;
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdNote.save({ session: sess });
    user.notes.push(createdNote);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    return next(err);
  }
  res.status(201).json({ note: createdNote });
};

const editNote = async (req, res, next) => {
  const { date, action, gratitude, journal, mood, image } = req.body;
  const noteId = req.params.nid;
  let note;
  try {
    note = await Note.findById(noteId);
  } catch (err) {
    console.log(err);
  }
  console.log(note);

  if (note.creator.toString() !== req.userData.userId) {
    res.status(401).json({ message: "You are not allowed to edit this note." });
  }
  note.date = date;
  note.action = action;
  note.gratitude = gratitude;
  note.journal = journal;
  note.mood = mood;
  if (req.file) {
    note.image = req.file.path;
  }
  console.log(note);
  try {
    await note.save();
  } catch (err) {
    console.log(err);
  }

  res.status(200).json({ note: note.toObject({ getters: true }) });
};

const deleteNote = async (req, res, next) => {
  const noteId = req.params.nid;
  let note;
  try {
    note = await Note.findById(noteId);
  } catch (err) {
    console.log(err);
  }
  try {
    await note.remove();
  } catch (err) {
    console.log(err);
    return next(err);
  }
  res.status(200).json({ message: "Deleted note." });
};

exports.getNoteByNoteId = getNoteByNoteId;
exports.createNote = createNote;
exports.editNote = editNote;
exports.deleteNote = deleteNote;
