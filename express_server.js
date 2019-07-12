const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.static('public'));

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
  console.log(Object.keys(users));
  for (let elt of Object.keys(users)){
  if (actual === users[elt]["email"]) {
    console.log(elt);
    console.log("exists");
    return false;
  } 
  console.log("doesnt exist");
}
return true;
}

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL.substring(1)];
//  console.log(longURL);
  
  res.redirect(longURL);
});
app.get("/", (req, res) => {
  res.send("Hello!");
});
app.post("/urls", (req, res) => {
  res.redirect('/urls');
})

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
/* app.post('/login', (req, res) => {
  res.cookie('username', req.body["username"]);
  res.redirect('/urls');
}) */
app.post("/logout", (req, res) => {
  res.clearCookie('username');

  res.redirect('/urls');
})
app.post("/register", (req, res) => {
  let templateVars;
  //console.log(req.body);
//console.log(req.body['email']);
  //console.log(Object.keys(req.body))
  //console.log(users);
  if(emailCheck(req.body['email'])){
  const id = generateRandomString()
  users[id] = { 
    id: id, 
    email: req.body.email,
    password: req.body.password
  }
 // console.log(users);
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
  delete urlDatabase[req.params.shortURL];
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
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("*", (req, res) => {
  res.send("404");
});
app.listen(PORT, () => {
//  console.log(`Example app listening on port ${PORT}!`);
});