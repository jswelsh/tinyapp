const express = require('express');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');

const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const dataHelpers = require('./helpers.js');

const userByEmail = dataHelpers.userByEmail;
const generateRandomString = dataHelpers.generateRandomString;
const userIDCheck = dataHelpers.userIDCheck;
const passwordCheck = dataHelpers.passwordCheck;
const createNewUser = dataHelpers.createNewUser;
const emailCheck = dataHelpers.emailCheck;
const urlCheck = dataHelpers.urlCheck;
const doesUrlExistAndOwned = dataHelpers.doesUrlExistAndOwned;
const urlsForUser = dataHelpers.urlsForUser;
const userByID = dataHelpers.userByID;
const loginCheck = dataHelpers.loginCheck;
const isEmpty = dataHelpers.isEmpty;

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(express.static('public'));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'Key2'],
}));

let urlDatabase = {};
let users = {};

// registeration route
app.post('/register', (req, res) => {
  //making sure fields aren't empty, prompt for proper input
  if ((isEmpty(req.body.email)) || (isEmpty(req.body.password))) {
    templateVars.error = 'Invalid input, populate fields';
    //ensure user doesn't already have an account
  } else if (emailCheck(req.body['email'], users)) {
    templateVars.error = 'Invalid email. Email already exists'
  } else {
    //setting user with new credentials as well as a clean url obj
    const id = generateRandomString();
    users[id] = createNewUser(id, req.body.email, req.body.password)
    urlDatabase[id] = {};
    req.session.userID = id;
    res.redirect('/urls/new');
  }

  res.render('urls_register', templateVars)
});
//login route
app.post('/login', (req, res) => {
  let templateVars = {};
  //making sure fields aren't empty, prompt for proper input
  if ((isEmpty(req.body.email)) || (isEmpty(req.body.password))) {
    templateVars.error = 'Invalid input, populate fields';
    //ensure users email exists
  } else if (!emailCheck(req.body['email'], users)) {
    templateVars.error = 'Invalid email';
    //authenticate login credentials
  } else if (passwordCheck(req.body['email'], req.body['password'], users)) {
    let user = userByEmail(req.body['email'], users);
    req.session.userID = user['id'];
    res.redirect('/urls');
  } else {
    templateVars.error = 'Invalid password'
  }
  res.render('urls_login', templateVars);
});
//logs user out route
app.post('/logout', (req, res) => {
  //clearing cookies, functionality can break
  //if these aren't cleared
  req.session = undefined;
  res.redirect('/urls');
});
//creates a new url shortener obj
app.post('/urls/newmake', (req, res) => {
  const id = generateRandomString();
  //making sure user is logged in, else redirect
  if (users[req.session.userID] === undefined) {
    let templateVars = {
      user: userByID(req.session.userID, users),
      urls: urlsForUser(req.session.userID, urlDatabase),
      error: 'User not Logged in!'
    };
    res.render('urls_login', templateVars);
  } else {
    urlDatabase[id] = {
      longURL: req.body.longURL,
      userID: req.session.userID
    };
    res.redirect(`/urls/${id}`);
  }
});
//short url obj deletion route for user
app.post('/urls/:shortURL/delete', (req, res) => {
  //check if user is actually logged in, else redirect
  if (loginCheck(req.session.userID)) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    //user gets redirected 
    let templateVars = {
      user: userByID(req.session.userID, users),
      urls: urlsForUser(req.session.userID, urlDatabase),
      error: 'User not Logged in!'
    };
    res.render('urls_login', templateVars);
  }
});
//updates longURL for unique short url route
app.post('/urls/:shortURL', (req, res) =>{
  //ensures user is logged in else redirects to login
  if (loginCheck(req.session.userID)) {
    //keeps the unique id for the new longURL
    urlDatabase[req.params.shortURL]['longURL'] = req.body.newURL;
    res.redirect('/urls');
  } else {
    //user gets redirected
    let templateVars = {
      user: userByID(req.session.userID, users),
      urls: urlsForUser(req.session.userID, urlDatabase),
      error: 'User not Logged in!'
    };
    res.render('urls_login', templateVars);
  }
});
//redirect
app.get('/', (req, res) => {
  res.redirect('/urls');
});
//registeration page route
app.get('/register', (req, res) => {
  //check if user is logged in, redirect if they are
  if (loginCheck(req.session.userID)) {
    console.log(req.session.userID)
    templateVars = {
    error: 'User logged in!',
    user: userByID(req.session.userID, users),
    urls: urlsForUser(req.session.userID, urlDatabase)
    }
    res.render('urls_index', templateVars);
  }
  templateVars = {
    user: userByID(req.session.userID, users),
    urls: urlsForUser(req.session.userID, urlDatabase)
    };
  res.render('urls_register', templateVars);
});
//login page route
app.get('/login', (req, res) => {
  let templateVars = {
    user: userByID(req.session.userID, users),
    urls: urlsForUser(req.session.userID, urlDatabase)
  };
  //check if user is logged in, redirect if they are
  if (((userIDCheck(req.session.userID, users)))) {
    templateVars.error = 'User already Logged in';
    res.render('urls_index', templateVars);
  } else {
    res.render('urls_login', templateVars);
  }
});
//users urls page route
app.get('/urls', (req, res) => {
  let templateVars = {
    user: userByID(req.session.userID, users),
    urls: urlsForUser(req.session.userID, urlDatabase)
  };
  //check if user is logged in, redirect if they aren't
  if ((userIDCheck(req.session.userID, users))) {
    //check if they have any URLs in their assigned obj,
    //redirect to create new short url page if they dont
    if (urlCheck(req.session.userID, urlDatabase)) {
      res.render('urls_index', templateVars);
    } else {
      //redirected to create new url
      templateVars = {
        user: userByID(req.session.userID, users),
        urls: urlsForUser(req.session.userID, urlDatabase),
        error: 'No URLs saved yet, create one!'
      };
      res.render('urls_new', templateVars);
    }
  } else {
    //redirected to login page
    templateVars = {
      user: userByID(req.session.userID, users),
      urls: urlsForUser(req.session.userID, urlDatabase),
      error: 'User not Logged in!'
    };
    res.render('urls_login', templateVars);
  }
});
//create new short url route
app.get('/urls/new', (req, res) => {
  if (req.session.userID) {
    let templateVars = {
      user: userByID(req.session.userID, users),
      urls: urlsForUser(req.session.userID, urlDatabase)
    };
    res.render('urls_new', templateVars);
  }
});
//show unique short url and its edit page route
app.get('/urls/:shortURL', (req, res) =>{
  //check if URL even exists is the database
  if (doesUrlExistAndOwned(req.params.shortURL,req.session.userID, urlDatabase)){
  let templateVars = {
    user: userByID(req.session.userID, users),
    urls: urlsForUser(req.session.userID, urlDatabase),
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]['longURL']
  };
  //check if the user is logged in, redirect if they arent
  if (loginCheck(req.session.userID)) {
    res.render('urls_show', templateVars);
  } else {
    //redirected to login page
    templateVars = {
      user: userByID(req.session.userID, users),
      urls: urlsForUser(req.session.userID, urlDatabase),
      error: 'User not Logged in!'
    };
    res.render('urls_login', templateVars);
  }
  }
  //redirect to create new url page as the url provided isn't owned/doesn't exist
  templateVars.error = `Address either doesn't exist or isn't owned by you!`;
  res.render('urls_new', templateVars
)});
//redirect to longURL using shortURL,
//regardless if url is owned by user
app.get('/u/:shortURL', (req, res) => {
  //setting the longURL for redirect
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]['longURL'];
  res.redirect(longURL);
});

app.get('*', (req, res) => {
  res.send('404');
});

app.listen(PORT, () => {
});