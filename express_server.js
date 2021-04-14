const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.bleh.com",
  "b2xVn1": "http://www.blah.ca",
  "9sm5xd": "http://www.blop.com"
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

let generateRandomString = () => {
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charLength = chars.length;
  let shortUrl = [];
  chars = chars.split("");

  for (let i = 0; i < 6; i++) {
    let randomNum = Math.floor(Math.random() * charLength);
    shortUrl.push(chars[randomNum]);
  }

  return shortUrl.join("");
};

let checkEmailExists = (lookup) => {
  for (const id in users) {
    if (users[id].email === lookup)
      return true;
  }
  return false;
}

//listens to port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//Home page sends hello
app.get("/", (req, res) => {
  res.send("Hello!");
});

//Home page sends hello

//page for new url
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user_id: req.cookies.user_id,
    users: users,
  }
  res.render("urls_new", templateVars);
});

// page to new create new shortlink url
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user_id: req.cookies.user_id,
    users: users,
  };
  res.render("urls_show", templateVars);
});

// functionality to create new shortlink url
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.newLongUrl;
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user_id: req.cookies.user_id,
    users: users,
  };

  res.render("urls_show", templateVars);
});

//deletes url
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  const templateVars = {
    urls: urlDatabase,
    user_id: req.cookies.user_id,
    users: users,
  };
  res.render("urls_index", templateVars);
});

//returns list or urls
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user_id: req.cookies.user_id,
    users: users,
  };
  res.render("urls_index", templateVars);
});

//edit a shortlink to url
app.post("/urls", (req, res) => {
  let shortLink = generateRandomString();
  urlDatabase[shortLink] = req.body.longURL;
  const templateVars = {
    shortURL: shortLink,
    longURL: urlDatabase[shortLink],
    user_id: req.cookies.user_id,
    users: users,
  };
  res.render("urls_show", templateVars);
});

//handles login
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  const templateVars = {
    user_id: req.body.user_id,
    urls: urlDatabase,
    users: users,
  };
  res.render("urls_index", templateVars);
});

//registration page
app.get("/register", (req, res) => {
  const templateVars = {
    user_id: req.body.user_id,
    users: users,
  };

  res.render("register", templateVars);
});
//registration page
app.post("/register", (req, res) => {
  let email;
  let password;
  let id = generateRandomString();

  if (checkEmailExists(email) || !req.body.email || !req.body.password) {
    res.sendStatus(400);
    res.redirect("/register");
  }
  else if (req.body.email && req.body.password) {
    email = req.body.email;
    password = req.body.password;

    users[id] = {
      id: id,
      email: email,
      password: password
    };

    res.cookie("user_id", id);
    res.redirect("/urls");
  }

});

//handles logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  const templateVars = {
    user_id: req.body.user_id,
    urls: urlDatabase,
    users: users,
  };
  res.render("urls_index", templateVars);
});

//edit 
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});


// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });
// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
// });

// app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
// });
