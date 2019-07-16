const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.static('public'));


let urlDatabase = {};
let users = {};

// using this format of cat two seperate strings randomly generated ensures 6 digits, in the rare
// chance that one of the strings generates one less digit (if used as one generater, can result in
// 5 char due to floating point round)
const  generateRandomString = function() {
  return Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5);
};
const userIDCheck = function(actual) {
  for (let elt of Object.keys(users)) {
    if (actual === elt) {
      return [true, elt];
    } else {
      return [false];
    }
  }
  return [false];
};

const emailCheck = function(actual) {
  for (let elt of Object.keys(users)) {
    if (actual === users[elt]['email']) {
      return [true, elt];
    } else {
      return [false];
    }
  }
  return [false];
};

const passwordCheck = function(actualEmail, actualPassword) {

  for (let elt of Object.keys(users)) {
    if (actualEmail === users[elt]["email"]) {
      if (actualPassword === users[elt]["password"]) {
        return [true, elt];
      }
    }
  }
  return [false];
};

const isEmpty = function(obj) {
  if ((obj === undefined) || (obj === null)) {
    return true;
  }
  if (Object.keys(obj).length === 0) {
    return true;
  }
  return false;
};

app.get("/", (req, res) => {
  let templateVars;
  if (req.cookies['username'] !== undefined) {
    res.render('urls_login', templateVars);
  } else {
    let templateVars = {
      username: req.cookies['username'],
      urls: urlDatabase[req.cookies['userID']]
    };
    res.render('urls_index', templateVars);
  }
});

app.get('/register', (req, res) => {

  if ((userIDCheck(req.cookies['userID']))[0]) {

    res.render('urls_index');
  } else {
    res.render('urls_register');
  }
});

app.post("/register", (req, res) => {
  let templateVars;
  if (((emailCheck(req.body['email']))[0])) {
    templateVars = {
      error: "User Credentials Already Exist!"
    };
    res.render('urls_register', templateVars);
  } else {

    const id = generateRandomString();
    users = {[id]:{
      id: id,
      email: req.body.email,
      password: req.body.password
    }};
    urlDatabase[id] = {};
    templateVars = {
      user: users[id],
      urls: urlDatabase[req.cookies['userID']],
      error: undefined
    };
    res.cookie('username', req.body['email']);
    res.cookie('userID', id);
    //res.render('urls_new', templateVars)
    res.redirect('/urls/new');
  }
});

app.get("/login", (req, res) => {
  let templateVars;
  if (((userIDCheck(req.cookies['userID']))[0])) {
    templateVars = {
      error: "User already Logged in"
    };
    res.render('urls_index', templateVars);
  } else {
    res.render('urls_login', templateVars);
  }
});

app.post("/login", (req, res) => {
  let loginAuthenticate = passwordCheck(req.body['email'], req.body['password']);
  let templateVars;
  if (loginAuthenticate[0] !== false) {
    res.cookie('username', req.body['email']);
    res.cookie('userID', loginAuthenticate[1]);
 
    res.redirect('/urls');
  } else {
    templateVars = {
      error: "User Credentials Incorrect!"
    };
    res.render('urls_login', templateVars);
  }
});

app.post("/logout", (req, res) => {
  let templateVars = {
    error: "User Logged Out!"
  };
  res.clearCookie('username');
  res.clearCookie('userID');
  res.render('urls_login', templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars;
  if ((userIDCheck(req.cookies['userID']))[0]) {
    if (isEmpty(urlDatabase[req.cookies['userID']])) {
      templateVars = {
        error: "No URLs saved yet, create one!"
      };
      res.render("urls_new", templateVars);
    } else {
      let templateVars = {
        username: req.cookies['username'],
        urls: urlDatabase[req.cookies['userID']]
      };
      res.render('urls_index', templateVars);
    }
  } else {
    templateVars = {
      error: "User not Logged in!"
    };
    res.render('urls_login', templateVars);
  }
});

app.post("/urls", (req, res) => {
  res.redirect('/urls');
}); // do i need this?

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies['username'],
  };
  res.render('urls_new', templateVars);
});

app.post("/urls/newmake", (req, res) => {
  const id = generateRandomString();
  const user = req.cookies['userID'];
  let templateVars; 
  if (users[req.cookies['userID']] === undefined) {
    templateVars = {
      error: "User not Logged in!"
    };
    res.render('urls_login', templateVars);
  } else {

    urlDatabase[user][id] = req.body.longURL;
    templateVars = {
      username: req.cookies['username'],
      urls: urlDatabase[user]
    };
    res.render('urls_index', templateVars);
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.cookies['userID']][req.params.shortURL];
  res.redirect('/urls');
});

app.get("/urls/:shortURL", (req, res) =>{
  let templateVars = {
    username: req.cookies['username'],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.cookies['userID']][req.params.shortURL]
  };
  res.render(`urls_show`, templateVars);
});

app.get("*", (req, res) => {
  res.send("404");
});

app.listen(PORT, () => {
});