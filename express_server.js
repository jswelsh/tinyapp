const express = require("express");
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session')
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.static('public'));
app.use(cookieSession({
  
  name: 'session',
  keys: ['key1', 'Key2'],
}));
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

const urlCheck = function(actual) {
  for (let elt in urlDatabase) {
    if (urlDatabase[elt]['userID'] === actual) {
        return true;
    }
    return false;
}
}

const urlsForUser = function(id) {
  let userURLs = { };
  for (shortURL in urlDatabase){
    if (urlDatabase[shortURL]['userID'] === id) {
      userURLs[shortURL] = Object.assign(urlDatabase[shortURL])
    }
  }
  return userURLs
};

const loginCheck = function(userID){
  if(userID !== undefined){
    return true;
  }
  return false;
}


const passwordCheck = function(actualEmail, actualPassword) {
  for (let elt of Object.keys(users)) {
    if (actualEmail === users[elt]["email"]) {
      if (bcrypt.compareSync(actualPassword, users[elt].password)) {
        ;
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
  if (req.session.userID !== undefined) {
    res.render('urls_login', templateVars);
  } else {
    let templateVars = {
      username: req.session.username,
      userID: req.session.userID,
      error: undefined
    };
    res.render('urls_index', templateVars);
  }
});

app.get('/register', (req, res) => {

  if ((userIDCheck(req.session.userID))[0]) {

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
      password: bcrypt.hashSync(req.body.password, 10)
    }};
    urlDatabase[id] = {};
    templateVars = {
      user: users[id],
      error: undefined
    };
    req.session.username = req.body['email'];
    req.session.userID = id;
    //res.render('urls_new', templateVars)
    res.redirect('/urls/new');
  }
});

app.get("/login", (req, res) => {
  let templateVars;
  if (((userIDCheck(req.session.userID))[0])) {
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
    req.session.username = req.body['email'];
    req.session.userID = loginAuthenticate[1];
 
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
  req.session = null
  res.render('urls_login', templateVars); 
});

app.get("/urls", (req, res) => {
  let templateVars;
  if ((userIDCheck(req.session.userID))[0]) {
    //NEED TO CHECK IF THERES ANY URLS FOR USER
    if (urlCheck(req.session.userID)){
      let templateVars = {
        username: req.session.username,
        urls: urlsForUser()
      };
      res.render('urls_index', templateVars);
    } else {
      templateVars = {
        error: "No URLs saved yet, create one!"
      };
      res.render("urls_new", templateVars);
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
    username: req.session.username,
  };
  res.render('urls_new', templateVars);
});

app.post("/urls/newmake", (req, res) => {
  const id = generateRandomString();
  let templateVars; 
  if (users[req.session.userID] === undefined) {
    templateVars = {
      error: "User not Logged in!"
    };
    res.render('urls_login', templateVars);
  } else {
    urlDatabase[id] = {
      longURL: req.body.longURL,
      userID: req.session.userID
    }
    //////////////fixing urls linked in urls_index
    templateVars = {
      username: req.session.username,
      urls: urlsForUser(req.session.userID)
    };
    res.render('urls_index', templateVars);
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (loginCheck(req.session.userID)){
  delete urlDatabase[req.params.shortURL];
  //MAY BE BROKEN
  res.redirect('/urls');
  } else {
    templateVars = {
      error: "User not Logged in!"
    };
    res.render('urls_login', templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) =>{
  let templateVars = {
    username: req.session.username,
  };
  if (loginCheck(req.session.username)){
    res.render(`urls_show`, templateVars);
  } else {
    templateVars = {
      error: "User not Logged in!"
    };
    res.render('urls_login', templateVars);
  }
});
app.post("/urls/:shortURL", (req, res) =>{
  let templateVars = {
    username: req.session.username,
  };
  if (loginCheck(req.session.username)){
    //maybe req.body
    urlDatabase[req.params.shortURL]['longURL'] = req.body.newURL
    res.render(`urls_show`, templateVars);
  } else {
    templateVars = {
      error: "User not Logged in!"
    };
    res.render('urls_login', templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  console.log(longURL, "a");
  
  res.redirect(longURL);
}); // MAYBE BROKEN

app.get("*", (req, res) => {
  res.send("404");
});

app.listen(PORT, () => {
});