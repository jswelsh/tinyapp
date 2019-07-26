const express = require("express");
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');

const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const dataHelpers = require("./helpers.js");

const userByEmail = dataHelpers.userByEmail;
const generateRandomString = dataHelpers.generateRandomString;
const userIDCheck = dataHelpers.userIDCheck;
const emailCheck = dataHelpers.emailCheck;
const urlCheck = dataHelpers.urlCheck;
const doesUrlExistAndOwned = dataHelpers.doesUrlExistAndOwned;
const urlsForUser = dataHelpers.urlsForUser;
const userByID = dataHelpers.userByID;
const loginCheck = dataHelpers.loginCheck;
const isEmpty = dataHelpers.isEmpty;

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

const passwordCheck = function(actualEmail, actualPassword) {
  for (let elt in users) {
    if (actualEmail === users[elt]["email"]) {
      if (bcrypt.compareSync(actualPassword, users[elt]['password'])) {
        return true;
      }
    }
  }
};

app.post("/register", (req, res) => {
  if ((isEmpty(req.body.email)) || (isEmpty(req.body.password))) {
    templateVars.error = "Invalid input, populate fields";
  } else if (emailCheck(req.body['email'], users)) {
    templateVars.error = "Invalid email. Email already exists"
  } else {
    const id = generateRandomString();
    users[id] = {
      id: id,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    urlDatabase[id] = {};
    req.session.userID = id;
    res.redirect('/urls/new');
  }

  res.render('urls_register', templateVars)
});

app.post("/login", (req, res) => {
  let templateVars = {};
  if ((isEmpty(req.body.email)) || (isEmpty(req.body.password))) {
    templateVars.error = "Invalid input, populate fields";
  } else if (!emailCheck(req.body['email'], users)) {
    templateVars.error = "Invalid email";
  } else if (passwordCheck(req.body['email'], req.body['password'])) {
    let user = userByEmail(req.body['email'], users);
    req.session.userID = user['id'];
    res.redirect('/urls');
  } else {
    templateVars.error = "Invalid password"
  }
  res.render('urls_login', templateVars);
});

app.post("/logout", (req, res) => {
  req.session = undefined;
  res.redirect('/urls');
});

app.post("/urls/newmake", (req, res) => {
  const id = generateRandomString();
  if (users[req.session.userID] === undefined) {
    let templateVars = {
      user: userByID(req.session.userID, users),
      urls: urlsForUser(req.session.userID, urlDatabase),
      error: "User not Logged in!"
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

app.post("/urls/:shortURL/delete", (req, res) => {
  if (loginCheck(req.session.userID)) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: userByID(req.session.userID, users),
      urls: urlsForUser(req.session.userID, urlDatabase),
      error: "User not Logged in!"
    };
    res.render('urls_login', templateVars);
  }
});

app.post("/urls/:shortURL", (req, res) =>{
  if (loginCheck(req.session.userID)) {
    urlDatabase[req.params.shortURL]['longURL'] = req.body.newURL;
    res.redirect('/urls');
  } else {
    let templateVars = {
      user: userByID(req.session.userID, users),
      urls: urlsForUser(req.session.userID, urlDatabase),
      error: "User not Logged in!"
    };
    res.render('urls_login', templateVars);
  }
});

app.get("/", (req, res) => {
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  if (loginCheck(req.session.userID)) {
    templateVars = {
    error: "User logged in!",
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

app.get("/login", (req, res) => {
  let templateVars = {
    user: userByID(req.session.userID, users),
    urls: urlsForUser(req.session.userID, urlDatabase)
  };
  if (((userIDCheck(req.session.userID, users)))) {
    templateVars.error = "User already Logged in";
    res.render('urls_index', templateVars);
  } else {
    res.render('urls_login', templateVars);
  }
});

app.get("/urls", (req, res) => {
  let templateVars = {
    user: userByID(req.session.userID, users),
    urls: urlsForUser(req.session.userID, urlDatabase)
  };
  if ((userIDCheck(req.session.userID, users))) {
    if (urlCheck(req.session.userID, urlDatabase)) {
      res.render('urls_index', templateVars);
    } else {
      templateVars = {
        user: userByID(req.session.userID, users),
        urls: urlsForUser(req.session.userID, urlDatabase),
        error: "No URLs saved yet, create one!"
      };
      res.render("urls_new", templateVars);
    }
  } else {
    templateVars = {
      user: userByID(req.session.userID, users),
      urls: urlsForUser(req.session.userID, urlDatabase),
      error: "User not Logged in!"
    };
    res.render('urls_login', templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  if (req.session.userID) {
    let templateVars = {
      user: userByID(req.session.userID, users),
      urls: urlsForUser(req.session.userID, urlDatabase)
    };
    res.render('urls_new', templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) =>{

  if (doesUrlExistAndOwned(req.params.shortURL,req.session.userID, urlDatabase)){
  let templateVars = {
    user: userByID(req.session.userID, users),
    urls: urlsForUser(req.session.userID, urlDatabase),
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]['longURL']
  };
  if (loginCheck(req.session.userID)) {
    res.render(`urls_show`, templateVars);
  } else {
    templateVars = {
      user: userByID(req.session.userID, users),
      urls: urlsForUser(req.session.userID, urlDatabase),
      error: "User not Logged in!"
    };
    res.render('urls_login', templateVars);
  }
}
res.status(404).send(" <h2>Error:</h2> <p>Address either doesn't exist or isn't owned by you.</p>");

});

app.get("/u/:shortURL", (req, res) => {

  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]['longURL'];
  res.redirect(longURL);
});

app.get("*", (req, res) => {
  res.send("404");
});

app.listen(PORT, () => {
});