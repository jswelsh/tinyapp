
module.exports = {
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

  userIDCheck: function(actual, users) {
    for (let elt in users) {
      if (actual === elt) {
        return true;
      }
    }
  },

  emailCheck: function(actual, users) {
    for (let elt in users) {
      if (actual === users[elt]['email']) {
        return true;
      }
    }
  },

  urlCheck: function(actual, urlDatabase) {
    for (let elt in urlDatabase) {
      if (urlDatabase[elt]['userID'] === actual) {
        return true;
      }
    }
  },
  doesUrlExistAndOwned: function(actual, userID, urlDatabase) {
    for (let elt in urlDatabase) {
      if (elt === actual) {
        if(urlDatabase[elt]['userID'] === userID){
          return true;
        }
      }
    }
  },

  urlsForUser: function(id, urlDatabase) {
    let userURLs = { };
    for (let shortURL in urlDatabase) {
      if (urlDatabase[shortURL]['userID'] === id) {
        userURLs[shortURL] = Object.assign(urlDatabase[shortURL]);
      }
    }
    return userURLs;
  },

  userByID: function(id, users) {
    if (id) {
      return users[id];
    }
  },

  loginCheck: function(userID) {
    if (userID !== undefined) {
      return true;
    }
  },

  isEmpty: function(obj) {
    if ((obj === undefined) || (obj === null)) {
      return true;
    }
    if (Object.keys(obj).length === 0) {
      return true;
    }
  }
};
