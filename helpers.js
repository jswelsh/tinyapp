const bcrypt = require('bcrypt');
module.exports = {
  
  //returns user info using email
  userByEmail: function(email, users) {
    for (let elt in users) {
      if (users[elt]['email'] === email) {
        return users[elt];
      }
    }
  },
  // using this format of cat two seperate strings randomly generated ensures 6 digits, in the rare
  // chance that one of the strings generates one less digit (if used as one generater, can result in
  // 5 char due to floating point round)
  generateRandomString: function() {
    return Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5);
  },
  //check if user is logged in to be redirected if they are
  userIDCheck: function(actual, users) {
    for (let elt in users) {
      if (actual === elt) {
        return true;
      }
    }
  },
  //checks if password matches stored credentials
  passwordCheck: function(actualEmail, actualPassword, users) {
    for (let elt in users) {
      if (actualEmail === users[elt]['email']) {
        if (bcrypt.compareSync(actualPassword, users[elt]['password'])) {
          return true;
        }
      }
    }
  },
  //create  new user obj
  createNewUser: function(id, email, password){
    return {
      'id': id,
      'email': email,
      'password': bcrypt.hashSync(password, 10)
    };
  },
  //checking if email exists for redirection or login authentication
  emailCheck: function(actual, users) {
    for (let elt in users) {
      if (actual === users[elt]['email']) {
        return true;
      }
    }
  },
  //check if url exists in database
  urlCheck: function(actual, urlDatabase) {
    for (let elt in urlDatabase) {
      if (urlDatabase[elt]['userID'] === actual) {
        return true;
      }
    }
  },
  //checking if the url exist...this also checks if it's owned by a user
  doesUrlExistAndOwned: function(actual, userID, urlDatabase) {
    for (let elt in urlDatabase) {
      if (elt === actual) {
        if(urlDatabase[elt]['userID'] === userID){
          return true;
        }
      }
    }
  },
  //returns all the urls owned by user
  urlsForUser: function(id, urlDatabase) {
    let userURLs = { };
    for (let shortURL in urlDatabase) {
      if (urlDatabase[shortURL]['userID'] === id) {
        userURLs[shortURL] = Object.assign(urlDatabase[shortURL]);
      }
    }
    return userURLs;
  },
  // returns user info using their id
  userByID: function(id, users) {
    if (id) {
      return users[id];
    }
  },
  //checks if a user is currently logged in, used for redirection
  loginCheck: function(userID) {
    if (userID !== undefined) {
      return true;
    }
  },
  //checks if an obj is empty
  isEmpty: function(obj) {
    if ((obj === undefined) || (obj === null)) {
      return true;
    }
    if (Object.keys(obj).length === 0) {
      return true;
    }
  }
};
