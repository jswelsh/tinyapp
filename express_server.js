const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

function generateRandomString() {
  return Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5);
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL.substring(1)];
  console.log(longURL);
  
  res.redirect(longURL);
});
app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
app.post("/urls/newmake", (req, res) => {
  const hold = generateRandomString()
  req.body[Object.keys(req.body)[0]];
  urlDatabase[hold] = req.body[Object.keys(req.body)[0]];
  console.log(urlDatabase);
  res.redirect(`/urls`);
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
})
app.post("/urls/:shortURL", (req, res) =>{
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase };
  res.render(`urls_show`, templateVars);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("*", (req, res) => {
  res.send("404");
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});