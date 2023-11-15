const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const multer = require('multer');
require('dotenv').config();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const Post = require('./models/post');
const User = require('./models/user');
const Comment = require('./models/comment');

const mongoDb = process.env.uri;
mongoose.connect(mongoDb, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'mongo connection error'));

const app = express();
app.set("views", path.join(__dirname, '/views'));
app.use(express.static(__dirname));
app.set("view engine", "ejs");

app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

function toBase64(arr) {
  return btoa(
    arr.reduce((data, byte) => data + String.fromCharCode(byte), '')
  );
}

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
app.post('/posts', upload.single('photo'), async (req, res, next) => {
  try {
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      author: res.locals.currentUser.id,
      image: {
        file: req.file.buffer,
        filename: req.file.originalname,
        mimetype: req.file.mimetype
      }
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

app.post('/users/new', async (req, res, next) => {
  try {
    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      if (err) {
        return next(err);
      } else {
        const user = new User({
          username: req.body.username,
          password: hashedPassword,
          first_name: req.body.first_name,
          family_name: req.body.family_name,
          admin: false
        });
        await user.save();
        res.redirect('/');
      }
    });
  } catch(err) {
    return next(err);
  }
});

app.post('/users/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/'
}));

app.post('/users/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.send({ message: 'logout' });
  });
});
// READ
app.get('/', async (req, res) => {
  const posts = await Post.find({}).then((data) => {
    return data.map(post => {
      return {
        id: post._id.toString(),
        title: post.title,
        content: post.content,
        image: {
          file: post.image.file,
          filename: post.image.filename,
          mimetype: post.image.mimetype
        },
        createdAt: new Date(post.createdAt).toISOString()
      }
    });
  });
  res.render('index', { user: res.locals.currentUser, admin: res.locals.currentUser ? res.locals.currentUser : false, posts });
});

app.get('/users/login', (req, res) => {
  res.render('auth', { formType: 'login' });
});

app.get('/users/signup', (req, res) => {
  res.render('auth', { formType: 'signup' });
});

app.get('/posts/new', (req, res) => {
  res.render('post');
});

app.get('/posts/:postId', async (req, res, next) => {
  const post = await Post.findById(req.params.postId);
  const comments = await Comment.find({ post: post.id });
  res.render('detail', { post, user: res.locals.currentUser, comments });
});
// UPDATE
app.put('/posts/:postId', (req, res) => {

});
// DELETE


app.listen(3000, () => {
  console.log('Blog API is listening on port 3000');
});