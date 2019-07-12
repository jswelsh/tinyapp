const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.static('public'));
// using this format of cat two seperate strings randomly generated ensures 6 digits, in the rare
// chance that one of the strings generates one less digit (if used as one generater, can result in
// 6 random char....with a rare chance of 5)
function generateRandomString() {
  return Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5);
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const emailCheck = function(actual) {

  for (let elt of Object.keys(users)){
  if (actual !== users[elt]["email"]) {
  } else {
      return false;
  }
}
return true;
}
const passwordCheck = function(actualEmail, actualPassword) {

  for (let elt of Object.keys(users)){
  if (actualEmail === users[elt]["email"]) {
    if (actualPassword === users[elt]["password"])
    return true;
  }
}
return false;
}

/* app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL.substring(1)];
//  console.log(longURL);
  
  res.redirect(longURL);
}); */
/* app.get("/", (req, res) => {
  res.send("Hello!");
});
app.post("/urls", (req, res) => {
  res.redirect('/urls');
}) */

app.get("/urls", (req, res) => {
  let templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"] 
  };
  res.render("urls_index", templateVars);
});
app.post("/urls/newmake", (req, res) => {
  const id = generateRandomString()
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls`);
});
app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
  };
  res.render('urls_new', templateVars); 
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');

  res.redirect('/urls');
})


app.get("/urls/login", (req, res) => {
  res.render('urls_login', req);
})

app.post("/urls/login", (req, res) => {
/*   if(passwordCheck()){
  res.cookie('username', req.body["username"]); */
  res.render('urls_index');
/*   } */
})

app.post("/register", (req, res) => {
  let templateVars;
  if(emailCheck(req.body['email'])){
  const id = generateRandomString()
  users[id] = { 
    id: id, 
    email: req.body.email,
    password: req.body.password
  }
  res.cookie('username', id);
  res.redirect('/urls');
} else {
    templateVars = {
    error: "User Credentials Already Exist!"
  }
  res.render('urls_register', templateVars)
}
})


app.get("/register", (req, res) => {
  res.render('urls_register');
});
app.post("/urls/:shortURL/delete", (req, res) => {

  delete urlDatabase[req.params['shortURL']];
  res.redirect('/urls');
})
app.get("/urls/:shortURL", (req, res) =>{
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase,
    username: req.cookies["username"], 
  };
  res.render(`urls_show`, templateVars);
});
app.get("*", (req, res) => {
  res.send("404");
});
app.listen(PORT, () => {
});