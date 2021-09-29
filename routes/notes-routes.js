const express = require('express');
const auth = require('../middleware/auth');
const notesController = require('../controllers/notes-controller');
const imageHandler = require('../middleware/image-handling');

const router = express.Router();

// protect routes below auth middleware
router.use(auth);

router.get('/:nid', notesController.getNoteByNoteId);
router.post(
  '/add-note',
  imageHandler.single('image'),
  notesController.createNote
);
router.patch('/:nid', imageHandler.single('image'), notesController.editNote);
router.delete('/:nid', notesController.deleteNote);

module.exports = router;
