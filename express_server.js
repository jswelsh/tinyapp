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
      return true;
    } else {
      return false;
    }
  }
  return false;
};

const emailCheck = function(actual) {
  for (let elt of Object.keys(users)) {
    if (actual === users[elt]['email']) {
      return true;
    } else {
      return false;
    }
  }
  return false;
};

const urlCheck = function(actual) {
  for (let elt in urlDatabase) {
    if (urlDatabase[elt]['userID'] === actual) {
        return true;
    }
}
return false;
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
const userByID = function (id) {
  if(id){
    return users[id]
  }
  return undefined
}
const userByEmail = function (email) {
  console.log(email, "email in userby email")
  for (elt in users){
    console.log(elt)
    if (users[elt]['email'] === email){
      return users[elt];
    }
  }
}
const loginCheck = function(userID){
  if(userID !== undefined){
    return true;
  }
  return false;
}


const passwordCheck = function(actualEmail, actualPassword) {
  for (let elt of Object.keys(users)) {
    if (actualEmail === users[elt]["email"]) {
      if (bcrypt.compareSync(actualPassword, users[elt]['password'])) {
        return true;
      }
    }
  }
  return false;
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
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  let templateVars = {
    user: userByID(req.session.userID),
    urls: urlsForUser(req.session.userID)
  };
  /*
  if ((userIDCheck(req.session.userID))[0]) {
    res.render('urls_index', templateVars);
  } else { */
    res.render('urls_register', templateVars);
 /*  } */
});

app.post("/register", (req, res) => {
/*   let templateVars = {
    user: userByID(req.session.userID),
    urls: urlsForUser(req.session.userID)
  }; */
  if (emailCheck(req.body['email'])) {
    templateVars = {
      user: userByID(req.session.userID),
      urls: urlsForUser(req.session.userID),
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
/*     templateVars = {   
      user: userByID(req.session.userID),
      urls: urlsForUser(req.session.userID),
      error: undefined
    }; */
    req.session.userID = id;
    res.redirect('/urls/new');
  }
});

app.get("/login", (req, res) => {
  let templateVars = {
    user: userByID(req.session.userID),
    urls: urlsForUser(req.session.userID)
  };
  if (((userIDCheck(req.session.userID)))) {
    templateVars.error = "User already Logged in"
    res.render('urls_index', templateVars);
  } else {
    res.render('urls_login', templateVars);
  }
});
//need to fix
app.post("/login", (req, res) => {
  console.log(req.body['email'],req.body['password'])
  console.log(passwordCheck(req.body['email'], req.body['password']))
  if (passwordCheck(req.body['email'], req.body['password'])) {
    let user = userByEmail(req.body['email']);
    console.log(user)
    console.log(user['id'], "gi")
    req.session.userID = user['id'];
    
    res.redirect('/urls');
  } else {
    let templateVars = {
      user: userByID(req.session.userID),
      urls: urlsForUser(req.session.userID),
      error: "User Credentials Incorrect!"
    };
    res.render('urls_login', templateVars);
  }
});

app.post("/logout", (req, res) => {
  req.session = undefined
  let templateVars = {};
  res.render('urls_login', templateVars); 
});

app.get("/urls", (req, res) => {
  let templateVars = {
    user: userByID(req.session.userID),
    urls: urlsForUser(req.session.userID)
  }
/*   res.render('urls_index', templateVars) */
  if ((userIDCheck(req.session.userID))) {
    //NEED TO CHECK IF THERES ANY URLS FOR USER
    if (urlCheck(req.session.userID)){
      res.render('urls_index', templateVars);
    } else {
      templateVars = {
        user: userByID(req.session.userID),
        urls: urlsForUser(req.session.userID),
        error: "No URLs saved yet, create one!"
      };
      res.render("urls_new", templateVars);
    }
  } else {
    templateVars = {
      user: userByID(req.session.userID),
      urls: urlsForUser(req.session.userID),
      error: "User not Logged in!"
    };
    res.render('urls_login', templateVars);
  }
});

/* app.post("/urls", (req, res) => {
  res.redirect('/urls');
}); // do i need this?
 */
app.get("/urls/new", (req, res) => {
  if (req.session.userID){
  let templateVars = {
    user: userByID(req.session.userID),
    urls: urlsForUser(req.session.userID)
  };
  res.render('urls_new', templateVars);
} else {
  /*   
     templateVars = {
      user: userByID(req.session.userID),
      urls: urlsForUser(req.session.userID),
      error: "User not Logged in!"
    };
    res.render('urls_login', templateVars);  */
}
});

app.post("/urls/newmake", (req, res) => {
  const id = generateRandomString();
/*   let templateVars = {
    user: userByID(req.session.userID),
    urls: urlsForUser(req.session.userID)
  }  */
  if (users[req.session.userID] === undefined) {
    templateVars = {
      user: userByID(req.session.userID),
      urls: urlsForUser(req.session.userID),
      error: "User not Logged in!"
    };
    res.render('urls_login', templateVars);
  } else {
 /*    console.log(req.body) */
    urlDatabase[id] = {
      longURL: req.body.longURL,
      userID: req.session.userID
    }
    //////////////fixing urls linked in urls_index
/*     console.log(urlsForUser(req.session.userID))
    templateVars = {
      user: userByID(req.session.userID),
      urls: urlsForUser(req.session.userID)
    }; */
/*     res.render('urls_index', templateVars); */
    res.redirect(`/urls/${id}`);
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (loginCheck(req.session.userID)){
  delete urlDatabase[req.params.shortURL];
/*   templateVars = {
    user: userByID(req.session.userID),
    urls: urlsForUser(req.session.userID)
  };
  //MAY BE BROKEN
  res.render('urls_index', templateVars); */
  res.redirect("/urls")
  } else {
    templateVars = {
      user: userByID(req.session.userID),
      urls: urlsForUser(req.session.userID),
      error: "User not Logged in!"
    };
    res.render('urls_login', templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) =>{
  let templateVars = {
    user: userByID(req.session.userID),
    urls: urlsForUser(req.session.userID),
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]['longURL']
  };
  if (loginCheck(req.session.userID)){
    res.render(`urls_show`, templateVars);
  } else {
    templateVars = {
      user: userByID(req.session.userID),
      urls: urlsForUser(req.session.userID),
      error: "User not Logged in!"
    };
    res.render('urls_login', templateVars);
  }
});
app.post("/urls/:shortURL", (req, res) =>{
/*   let templateVars = {
    user: userByID(req.session.userID),
    urls: urlsForUser(req.session.userID)
  }
  console.log(req.body) */
  if (loginCheck(req.session.userID)){
    //maybe req.body
    urlDatabase[req.params.shortURL]['longURL'] = req.body.newURL;
/*     templateVars = {
      user: userByID(req.session.userID),
      urls: urlsForUser(req.session.userID)
    }
    */
/*     res.render('urls_index', templateVars);  */
    res.redirect('/urls');
  } else {
    templateVars = {
      user: userByID(req.session.userID),
      urls: urlsForUser(req.session.userID),
      error: "User not Logged in!"
    };
    res.render('urls_login', templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]['longURL']
  console.log(longURL);
  res.redirect(longURL);
}); // MAYBE BROKEN

app.get("*", (req, res) => {
  res.send("404");
});

app.listen(PORT, () => {
});