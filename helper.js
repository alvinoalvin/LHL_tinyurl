
/*
generates a random string of 6 alphanumeric chars and returns
*/
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

/* checks whether the email exists in our datastructure */
let checkEmailExists = (lookup, users) => {
  for (const id in users) {
    if (users[id].email === lookup)
      return true;
  }
  return false;
};

/* returns the user_id from user data using the email */
let getUserIdfromEmail = (lookup, users) => {
  for (const id in users) {
    if (users[id].email === lookup)
      return id;
  }
  return undefined;
};

/* returns the objects related to the user */
let getUserObjects = (user, urlDatabase) => {
  if (!user) {
    return {};
  }
  let returnObj = {};
  for (let obj in urlDatabase) {
    if (urlDatabase[obj].userID === user) {
      returnObj[obj] = urlDatabase[obj];
    }
  }
  return returnObj;
};

module.exports = {
  generateRandomString,
  checkEmailExists,
  getUserIdfromEmail,
  getUserObjects,
};