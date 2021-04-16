const cookieSession = require('cookie-session');
const express = require("express");
const bcrypt = require('bcrypt');
const helpers = require('./helper');
const { PORT, urlDatabase, users } = require("./database");
const methodOverride = require('method-override')
const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(cookieSession({
  name: 'session', keys: ["secret", "keys"], maxAge: (24 * 60 * 60 * 1000) //max age 24hrs
}));
app.use(methodOverride('_method'))


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
  const userSessId = req.session.userId;
  const templateVars = {
    userId: userSessId,
    users: users,
    error: null,
  };

  if (userSessId) {
    res.render("urls_new", templateVars);
  } else {
    templateVars.error = "please log in to create a new tinyURL";
    res.status(403).render("login", templateVars);
  }
});

/* put:creates new tinyURL */
app.put("/urls/new", (req, res) => {
  const userSessId = req.session.userId;
  let shortLink = helpers.generateRandomString();

  urlDatabase[shortLink] = {
    longURL: req.body.longURL,
    userID: userSessId,
    urlDatabase: urlDatabase,
  };

  res.redirect(shortLink);
});

/* get: record view for a tinyurl */
app.get("/urls/:shortURL", (req, res) => {
  const userSessId = req.session.userId;
  const shortURL = req.params.shortURL

  const templateVars = {
    shortURL: shortURL,
    urlDatabase: urlDatabase,
    urls: helpers.getUserObjects(userSessId, urlDatabase),
    userId: userSessId,
    users: users,
    error: null,
  };
  if (userSessId === urlDatabase[req.params.shortURL].userID) {
    res.render("urls_show", templateVars);
  }
  else {
    templateVars.error = "Unable to access tinyURL as it's not associated with your account.";
    res.status(403).render("urls_index", templateVars);
  }
});

/* post: edits the tinyurl */
app.post("/urls/:shortURL", (req, res) => {
  const userSessId = req.session.userId;
  const templateVars = {
    shortURL: req.params.shortURL,
    urlDatabase: urlDatabase,
    userId: userSessId,
    users: users,
    error: null,
  };

  if (userSessId === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL] = {
      longURL: req.body.newLongUrl,
      userID: userSessId
    };
    res.render("urls_show", templateVars);
  } else {
    templateVars.error = "Unable to edit tinyURL as it's not associated with your account.";
    res.status(403).render("urls_show", templateVars);
  }
});

/* post: deletes url */
app.delete("/urls/:shortURL", (req, res) => {
  const userSessId = req.session.userId;

  if (userSessId === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];

    const templateVars = {
      urls: helpers.getUserObjects(userSessId, urlDatabase),
      userId: userSessId,
      urlDatabase: urlDatabase,
      users: users,
      error: null,
    };
    res.render("urls_index", templateVars);
  }
  else {
    templateVars.error = "Unable to delete tinyURL as it's not associated with your account.";
    res.status(403).render(`/urls_show/`, templateVars);
  }

});


/* get: returns list of urls for the logged in user */
app.get("/urls", (req, res) => {
  const userSessId = req.session.userId;

  const templateVars = {
    urls: helpers.getUserObjects(userSessId, urlDatabase),
    userId: userSessId,
    users: users,
    error: null,
  };
  if (!userSessId) {
    templateVars.error = "please login to view.";
    res.status(403).render(`login`, templateVars);
  } else {
    res.render("urls_index", templateVars);
  }
});

/* get: retireves registration page */
app.get("/register", (req, res) => {
  const templateVars = {
    userId: req.body.userId,
    users: users,
    error: null,
  };

  res.render("register", templateVars);
});

/* post: registers user */
app.post("/register", (req, res) => {
  let { email, password } = req.body;
  const id = helpers.generateRandomString();
  const isInputBlank = !email || !password;
  const templateVars = {
    userId: req.body.userId,
    users: users,
    error: null,
  }

  if (isInputBlank) {
    templateVars.error = "Password or Email is blank";
    res.status(403).render(`register`, templateVars);
  }
  else if (helpers.checkEmailExists(email, users)) {
    templateVars.error = "Email already exists";
    res.status(403).render(`register`, templateVars);
  }

  if (!isInputBlank) {
    password = bcrypt.hashSync(password, 10);

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
    status: res.statusCode,
    error: null,
  };
  res.render("login", templateVars);
});

/* post: handles login */
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  let id = false;

  if (email) {
    if (helpers.checkEmailExists(email, users) && bcrypt.compareSync(password, users[helpers.getUserIdfromEmail(email, users)].password)) { //happy path :)
      id = helpers.getUserIdfromEmail(email, users);
      req.session.userId = id;
      res.redirect("/urls");
    }
  }
  else {
    const templateVars = {
      userId: req.session.userId,
      users: users,
      status: res.statusCode,
      error: null,
    };

    templateVars.error = "user doesnt exist or a field is empty";
    res.status(403).render(`login`, templateVars);
  }
});

/*post: handles logout */
app.post("/logout", (req, res) => {
  req.session = null;

  const templateVars = {
    userId: (req.body.userId),
    urls: {},
    users: users,
    error: null,
  };

  res.render("urls_index", templateVars);
});

/* redirects to longurl */
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});