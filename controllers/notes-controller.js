const mongoose = require('mongoose');
const User = require('../models/user');
const Note = require('../models/note');

const getNoteByNoteId = async (req, res, next) => {
  const auth = req.currentUser;
  const noteId = req.params.nid;

  let note;
  if (auth) {
    try {
      note = await Note.findById(noteId);
    } catch (err) {
      console.log(err);
      res.status(404).json({ message: 'Note not found.' });
    }
  }
  res.json({ note: note });
};

const createNote = async (req, res, next) => {
  const auth = req.currentUser;
  const reqUid = auth.uid;
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
    user = await User.findOne({ uid: reqUid });
  } catch (err) {
    res.status(404).json({
      message: 'Could not find user.',
    });
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
  const auth = req.currentUser;
  const { date, action, gratitude, journal, mood, image } = req.body;
  const noteId = req.params.nid;
  let note;
  try {
    note = await Note.findById(noteId);
  } catch (err) {
    console.log(err);
  }
  console.log(note);

  if (note.creator.toString() !== auth.uid) {
    res.status(401).json({ message: 'You are not allowed to edit this note.' });
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
  if (auth) {
    try {
      await note.save();
    } catch (err) {
      console.log(err);
    }
  }

  res.status(200).json({ note: note.toObject({ getters: true }) });
};

const deleteNote = async (req, res, next) => {
  const auth = req.currentUser;
  const noteId = req.params.nid;
  let note;
  try {
    note = await Note.findById(noteId);
  } catch (err) {
    console.log(err);
  }
  if (auth) {
    try {
      await note.remove();
    } catch (err) {
      console.log(err);
      return next(err);
    }
  }
  res.status(200).json({ message: 'Deleted note.' });
};

exports.getNoteByNoteId = getNoteByNoteId;
exports.createNote = createNote;
exports.editNote = editNote;
exports.deleteNote = deleteNote;
