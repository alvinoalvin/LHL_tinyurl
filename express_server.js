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

//listens to port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//Home page sends hello
app.get("/", (req, res) => {
  res.send("Hello!");
});

//page for new url
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies.username
  }
  res.render("urls_new", templateVars);
});

// page to new create new shortlink url
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies.username,
  };
  res.render("urls_show", templateVars);
});

// functionality to create new shortlink url
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.newLongUrl;
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies.username,
  };

  res.render("urls_show", templateVars);
});

//deletes url
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies.username,
  };
  res.render("urls_index", templateVars);
});

//returns list or urls
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies.username,
  };
  res.render("urls_index", templateVars);
});

//edit a shortlink to url
app.post("/urls", (req, res) => {
  let shortLink = generateRandomString();
  urlDatabase[shortLink] = req.body.longURL;
  const templateVars = {
    shortURL: shortLink, longURL: urlDatabase[shortLink],
    username: req.cookies.username,
  };
  res.render("urls_show", templateVars);
});

//handles login
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  const templateVars = {
    username: req.body.username,
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

//handles logout
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  const templateVars = {
    username: req.body.username,
    urls: urlDatabase
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
