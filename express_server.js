const cookieSession = require('cookie-session');
const express = require("express");
const bcrypt = require('bcrypt');
const helpers = require('./helper');
const { PORT, urlDatabase, users } = require("./database");
const methodOverride = require('method-override');
const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(cookieSession({
  name: 'session', keys: ["secret", "keys"], maxAge: (24 * 60 * 60 * 1000) //max age 24hrs
}));
app.use(methodOverride('_method'));

//listen to specified port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

/* index directs to register */
app.get("/", (req, res) => {
  helpers.happyRedirect(res, req, "register");
});

/* get: page containing tinyurl form */
app.get("/urls/new", (req, res) => {
  const userSessId = req.session.userId;
  const templateVars = {
    userId: userSessId,
    users: users,
    error: req.session.error,
  };

  if (userSessId) {
    helpers.happyRender(res, req, "urls_new", templateVars);
  } else {
    helpers.errorRedirect(res, req, 403, "please log in to create a new tinyURL", "/login/");
  }
});

/* put:creates new tinyURL */
app.put("/urls/new", (req, res) => {
  const userSessId = req.session.userId;
  const shortLink = helpers.generateRandomString();
  let longLink = req.body.longURL;

  if (!longLink.includes("https://") && !longLink.includes("http://") ) {
    longLink = `https://${longLink}`;
  }
  urlDatabase[shortLink] = {
    longURL: longLink,
    userID: userSessId,
    urlDatabase: urlDatabase,
  };

  helpers.happyRedirect(res, req, shortLink);
});

/* get: record view for a tinyurl */
app.get("/urls/:shortURL", (req, res) => {
  const userSessId = req.session.userId;
  const shortURL = req.params.shortURL;

  const templateVars = {
    shortURL: shortURL,
    urlDatabase: urlDatabase,
    urls: helpers.getUserObjects(userSessId, urlDatabase),
    userId: userSessId,
    users: users,
    error: req.session.error,
  };
  if (userSessId === urlDatabase[req.params.shortURL].userID) {
    helpers.happyRender(res, req, "urls_show", templateVars);
  } else {
    helpers.errorRedirect(res, req, 403, "Unable to access tinyURL as it's not associated with your account.", "/urls/");
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
    error: req.session.error,
  };

  if (userSessId === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL] = {
      longURL: req.body.newLongUrl,
      userID: userSessId
    };
    helpers.happyRender(res, req, "urls_show", templateVars);
  } else {
    helpers.errorRedirect(res, req, 403, "Unable to edit tinyURL as it's not associated with your account.", "/urls/" + req.params.shortURL);
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
      error: req.session.error,
    };
    helpers.happyRender(res, req, "urls_index", templateVars);
  } else {
    helpers.errorRedirect(res, req, 403, "Unable to delete tinyURL as it's not associated with your account.", "/urls/" + req.params.shortURL);
  }

});


/* get: returns list of urls for the logged in user */
app.get("/urls", (req, res) => {
  const userSessId = req.session.userId;

  const templateVars = {
    urls: helpers.getUserObjects(userSessId, urlDatabase),
    userId: userSessId,
    users: users,
    error: req.session.error,
  };
  if (!userSessId) {
    helpers.errorRedirect(res, req, 403, "please login to view.", "login");

  } else {
    helpers.happyRender(res, req, "urls_index", templateVars);
  }
});

/* get: retireves registration page */
app.get("/register", (req, res) => {
  const templateVars = {
    userId: req.body.userId,
    users: users,
    error: req.session.error,
  };

  helpers.happyRender(res, req, "register", templateVars);
});

/* post: registers user */
app.post("/register", (req, res) => {
  let { email, password } = req.body;
  const id = helpers.generateRandomString();
  const isInputBlank = !email || !password;

  if (isInputBlank) {
    helpers.errorRedirect(res, req, 403, "Password or Email is blank", "register");
  } else if (helpers.checkEmailExists(email, users)) {
    helpers.errorRedirect(res, req, 403, "Email already exists", "register");
  }

  if (!isInputBlank) {
    password = bcrypt.hashSync(password, 10);

    users[id] = {
      id: id,
      email: email,
      password: password
    };

    req.session.userId = id;
    helpers.happyRedirect(res, req, "/urls");
  }
});

/* get: retrieves login page */
app.get("/login", (req, res) => {
  let userID = false;

  if (req.body.userId) {
    userID = req.body.userId;
  }
  const templateVars = {
    userId: userID,
    users: users,
    status: res.statusCode,
    error: req.session.error,
  };
  helpers.happyRender(res, req, "login", templateVars);
});

/* post: handles login */
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const isInputBlank = !email || !password;

  if (isInputBlank) {
    helpers.errorRedirect(res, req, 403, "Password or Email is blank", "login");
  } else {
    const userID = helpers.getUserIdfromEmail(email, users);

    if (helpers.checkEmailExists(email, users) && bcrypt.compareSync(password, users[userID].password)) { //happy path :)
      req.session.userId = userID;
      helpers.happyRedirect(res, req, "/urls");
    } else {
      helpers.errorRedirect(res, req, 403, "user doesnt exist", "login");
    }
  }
});


/*post: handles logout */
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("urls");
});

/* redirects to longurl */
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});