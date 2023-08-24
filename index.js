const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const Post = require('./models/post');

const app = express();
app.set("views", path.join(__dirname, '/views'));
app.use(express.static(__dirname));
app.set("view engine", "ejs");

app.use(session({ secrets: "cats", resave: false, saveUnintialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username });

      if (!user) {
        return done(null, false, { message: "Incorrect username "});
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: "Incorrect Password" });
      }
      return done(null, user);
    } catch(err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch(err) {
    done(err);
  }
});

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

// CREATE
app.post('/posts', async (req, res, next) => {
  try {
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      author: res.locals.currentUser.id
    });
    await post.save();
    res.redirect('/');
  } catch(err) {
    return next(err);
  }
});

app.post('/comments', async (req, res, next) => {
  try {
    const comment = new Comment({
      content: req.body.content,
      author: req.body.author
    });
    await comment.save();
    res.redirect('/');
  } catch(err) {
    return next(err);
  }
});
// READ

// UPDATE

// DELETE

app.listen(3000, () => {
  console.log('Blog API is listening on port 3000');
});