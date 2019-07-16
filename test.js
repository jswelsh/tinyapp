const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
//const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.static('public'));

let urlDatabase = {
  xxxxxxx: {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
  },
  zzzzzz:{
    "ddxVn2": "http://www.hi.ca",
    "44m5xK": "http://www.jfffe.com"
  }
};

let users = {
  xxxxxx: {
    id: "xxxxxx",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  zzzzzz: {
    id: "zzzzzz",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// using this format of cat two seperate strings randomly generated ensures 6 digits, in the rare
// chance that one of the strings generates one less digit (if used as one generater, can result in
// 5 char due to floating point round)
const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5);
};

//throw in an object to make sure it isn't empty
const isEmpty = function(obj) {
  if ((obj === undefined) || (obj === null)) {
    return true;
  }
  if (Object.keys(obj).length === 0) {
    return true;
  }
  return false;
};

const emailCheck = function(actual) {

  for (let elt of Object.keys(users)) {
    if (actual !== users[elt]["email"]) {
      /* empty */
    } else {
      return false;
    }
  }
  return true;
};

const passwordCheck = function(actualEmail, actualPassword) {

  for (let elt of Object.keys(users)) {
    if (actualEmail === users[elt]["email"]) {
      if (actualPassword === users[elt]["password"]) {
        return true;
      }
    }
  }
  return false;
};

/* app.get("/u/:shortURL", (req, res) => {
  const longURL = [req.params.shortURL.substring(1)];
//  console.log(longURL);
  
  res.redirect(longURL);
}); */

app.get("/", (req, res) => {
  //console.log(req.cookies);
  if (isEmpty(req.cookies)) {
    res.redirect('/login');
  } else {
    res.redirect('/urls');
  }
});

app.get('/register', (req, res) => {
  let templateVars = {
    userID: req.cookies['userID'],
    urls: urlDatabase[req.cookies['userID']]
  };
  if (req.cookies['userID']) {
    res.redirect('/urls/');
  } else {
    res.render('urls_register', templateVars);
  }
});

app.post("/register", (req, res) => {
  let templateVars;
  if (emailCheck(req.body['email'])) {
    const id = generateRandomString();
    users[id] = {
      id: id,
      email: req.body.email,
      password: req.body.password
    };
    urlDatabase[id] = {};
    templateVars = {
      user: users[id],
      users: users
    };
    res.cookie('userID', id);
    res.redirect('/urls/new');//change to urls once if condition checks if there are urls for /urls w/ redirect to urls/new
  } else {
    templateVars = {
      error: "User Credentials Already Exist!"
    };
    res.render('urls_register', templateVars);
  }
});

app.get("/login", (req, res) => {
  let templateVars = {
    userID: req.cookies['userID'],
    urls: urlDatabase[req.cookies['userID']]
  };
  if (req.cookies['userID']) {
    res.redirect('/urls/');
  } else {
    res.render('urls_login', templateVars);
  }
});

app.post("/login", (req, res) => {
  let templateVars = {
    userID: req.cookies['userID'],
    urls: urlDatabase[req.cookies['userID']]
  };
  if (passwordCheck(req.body['email'], req.body['password'])) {
    for (let elt of Object.keys(users)) {
      if (Object.prototype.hasOwnProperty.call(users, "elt")) {
        res.cookie('userID', users[elt]['id']);
      }
    }
    res.redirect('/urls');
  } else {
    templateVars = {
      error: "User Credentials Incorrect!"
    };
    res.render('urls_login', templateVars);
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('userID');
  res.redirect('/urls');
});

app.get("/urls", (req, res) => {
  if (isEmpty(req.cookies)) {
    res.redirect('/login');
  } else {
    console.log(req.cookies['username']);
    let templateVars = {
      userID: req.cookies['userID'],
      urls: urlDatabase[req.cookies['userID']]
    };
    console.log(templateVars.urls);
    if (isEmpty(templateVars.urls)) {
      templateVars = {
        error: "No URLs saved yet, create one!"
      };
      res.render("urls_new", templateVars);
    }
    res.render('urls_index', templateVars);
  }
});

/* app.post("/urls", (req, res) => {
  res.render('urls_index');
}); */

/* app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies['username']
  };
  res.render("urls_index", templateVars);
}); */

app.post("/urls/newmake", (req, res) => {
  //console.log(req.body['longURL']);
  const id = generateRandomString();
  console.log(req.cookies['userID']);
  console.log (urlDatabase[req.cookies['userID']][id])
  console.log(req.body['longURL'])
  urlDatabase[req.cookies['userID']][id] = req.body['longURL'];

  let templateVars = {
    userID: req.cookies['userID'],
    urls: urlDatabase[req.cookies['userID']]
  };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    userID: req.cookies['userID'],
  };
  res.render('urls_new', templateVars);
});

app.post('/urls/:shortURL/update', (req, res) => {
  const newLongURL = req.body['newURL'];
  const userID = (req.cookies.userID);
  const usersURLS = (urlDatabase[userID]);
  const [hold] = Object.keys(usersURLS);

  urlDatabase[userID][hold] = newLongURL;
  const templateVars = {
    userID: req.cookies['userID'],
    urls: urlDatabase[req.cookies['userID']]
  };

  res.render('urls_index', templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortlink = (req.params);
  const userID = (req.cookies['userID']);
  const templateVars = {
    userID: req.cookies['userID'],
    urls: urlDatabase[req.cookies['userID']]
  };
  delete urlDatabase[userID][shortlink];
  res.render('urls_index', templateVars);
});

app.get("/urls/:shortURL", (req, res) =>{
  let templateVars = {
    userID: req.cookies['userID'],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.cookies['userID']][req.params.shortURL]
  };
  //console.log(urlDatabase[req.cookies['userID']][req.params.shortURL]);
  res.render(`urls_show`, templateVars);
});

/* may need to add this

app.post('/urls/:shortURL/', (req, res) => {
  if (req.body.?????????????????.length > 0 && req.session.user_id) {
    urlDatabase[req.params.?????????????].longURL = req.body.??????;
    res.redirect('/urls');
  }
  else {
    ??????????????res.sendStatus(400);*/

app.get("*", (req, res) => {
  res.send("404");
});

app.listen(PORT, () => {
});