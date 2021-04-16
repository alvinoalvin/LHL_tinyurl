
const PORT = 8080; // default port 8080

/* Link Data */
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.bleh.com", userID: "userRandomID" },
  "b2xVn1": { longURL: "http://www.blah.ca", userID: "blah" },
  "9sm5xd": { longURL: "http://www.blop.com", userID: "blah" },
  "9sm5xf": { longURL: "http://www.bloop.com", userID: "blah" },
};

/* Users Data */
const users = {
  "blah": {
    id: "blah",
    email: "blah@blah",
    password: "$2b$10$kgeP.IKj6/OBKDm9GK7pKeih77oB.9SkPbQwdHpngUWKASVMLxD8K"
  },
  "userRandomID": {
    id: "userRandomID",
    email: "userRandomID@userRandomID",
    password: "$2b$10$2oYIz1ufoG3qpjavWDl4FOn.yzuq6Cnso8tJbG5dyGqqNbzVcVUaO"
  }
};

module.exports = { PORT, urlDatabase, users };