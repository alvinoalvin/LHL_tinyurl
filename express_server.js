let cookieSession = require('cookie-session');
const express = require("express");
const bcrypt = require('bcrypt');
const helpers = require('./helper');
const { PORT, urlDatabase, users } = require("./database");
const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(cookieSession({
  name: 'session', keys: ["secret", "keys"], maxAge: (24 * 60 * 60 * 1000)
}));


//listen to specified port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

/* index directs to register */
app.get("/", (req, res) => {
  res.redirect("register");
});

/* get: page containing tinyurl form */
app.get("/urls/new", (req, res) => {
  let userSessId = req.session.userId;
  const templateVars = {
    userId: userSessId,
    users: users,
  };

  if (userSessId) {
    res.render("urls_new", templateVars);
  }
  res.render("login", templateVars);

});

/* get: record view for a tinyurl */
app.get("/urls/:shortURL", (req, res) => {
  let userSessId = req.session.userId;

  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    userId: userSessId,
    users: users,
  };
  if (userSessId) {
    res.render("urls_show", templateVars);
  }

  res.status(403).send('Forbidden: you are unable to access this information.');
});

/* post: edits the tinyurl */
app.post("/urls/:shortURL", (req, res) => {
  let userSessId = req.session.userId;

  if (userSessId === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL] = {
      longURL: req.body.newLongUrl,
      userID: userSessId
    };
  }

  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    userId: userSessId,
    users: users,
  };

  res.render("urls_show", templateVars);
});

/* post: deletes url */
app.post("/urls/:shortURL/delete", (req, res) => {
  let userSessId = req.session.userId;

  if (userSessId === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];

    const templateVars = {
      urls: helpers.getUserObjects(userSessId, urlDatabase),
      userId: userSessId,
      users: users,
    };
    res.render("urls_index", templateVars);
  }

  res.status(403).send('Error 403: You do not have permission to delete this entry');

});


/* get: returns list of urls for the logged in user */
app.get("/urls", (req, res) => {
  let userSessId = req.session.userId;
  const templateVars = {
    urls: helpers.getUserObjects(userSessId, urlDatabase),
    userId: userSessId,
    users: users,
  };
  res.render("urls_index", templateVars);
});

/* post: creates new tinyurl */
app.post("/urls", (req, res) => {
  let userSessId = req.session.userId;
  let shortLink = helpers.generateRandomString();

  urlDatabase[shortLink] = {
    longURL: req.body.longURL,
    userID: userSessId
  };

  const templateVars = {
    shortURL: shortLink,
    longURL: urlDatabase[shortLink].longURL,
    userId: userSessId,
    users: users,
  };

  res.render("urls_show", templateVars);
});

/* get: retireves registration page */
app.get("/register", (req, res) => {
  const templateVars = {
    userId: req.body.userId,
    users: users,
  };

  res.render("register", templateVars);
});

/* post: registers user */
app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let id = helpers.generateRandomString();

  password = bcrypt.hashSync(password, 10);

  if (helpers.checkEmailExists(email, users) || !email || !password) {
    res.status(403).send('Email already exists or a field is empty');
  }
  else if (req.body.email && req.body.password) {
    users[id] = {
      id: id,
      email: email,
      password: password
    };

    req.session.userId = id;
    res.redirect("/urls");
  }
});

/* get: retrieves login page */
app.get("/login", (req, res) => {
  let id = false;

  if (req.body.userId) {
    id = req.body.userId;
  }
  const templateVars = {
    userId: id,
    users: users,
    status: res.statusCode
  };
  res.render("login", templateVars);
});

/* post: handles login */
app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let id = false;

  if (email) {
    if (helpers.checkEmailExists(email, users) && bcrypt.compareSync(password, users[helpers.getUserIdfromEmail(email, users)].password)) { //happy path :)
      id = helpers.getUserIdfromEmail(email, users);
      req.session.userId = id;
      res.redirect("/urls");
    }
  }
  res.status(403).send('user doesnt exist or a field is empty');
});

/*post: handles logout */
app.post("/logout", (req, res) => {
  req.session = null;

  const templateVars = {
    userId: (req.body.userId),
    urls: {},
    users: users,
  };

  res.render("urls_index", templateVars);
});

/* redirects to longurl */
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});