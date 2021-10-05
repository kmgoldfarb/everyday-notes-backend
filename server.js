require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const compression = require('compression');
const usersRoutes = require('./routes/users-routes');
const notesRoutes = require('./routes/notes-routes');
const path = require('path');

const app = express();
app.use(express.json());

app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  next();
});

app.use('/api/users', usersRoutes);
app.use('/api/notes', notesRoutes);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_KEY}@cluster0.hqwcf.mongodb.net/${process.env.MONGODB_DBNAME}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(5000);
  })
  .catch((err) => {
    console.log(err);
  });
