
/*
generates a random string of 6 alphanumeric chars and returns
*/
const generateRandomString = () => {
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charLength = chars.length;
  const shortUrl = [];
  chars = chars.split("");

  for (let i = 0; i < 6; i++) {
    const randomNum = Math.floor(Math.random() * charLength);
    shortUrl.push(chars[randomNum]);
  }

  return shortUrl.join("");
};

/* checks whether the email exists in our datastructure */
const checkEmailExists = (lookup, users) => {
  for (const userId in users) {
    if (users[userId].email === lookup)
      return true;
  }
  return false;
};

/* returns the user_id from user data using the email */
const getUserIdfromEmail = (lookup, users) => {
  for (const userId in users) {
    if (users[userId].email === lookup)
      return userId;
  }
  return undefined;
};

/* returns the objects related to the user */
const getUserObjects = (user, urlDatabase) => {
  if (!user) {
    return {};
  }
  const userObj = {};
  for (const urlObj in urlDatabase) {
    if (urlDatabase[urlObj].userID === user) {
      userObj[urlObj] = urlDatabase[urlObj];
    }
  }
  return userObj;
};

/* set the error message and redirect if errors are occuring */
const errorRedirect = (res, req, errorCode, errorMessage, redirectPage) => {
  req.session.error = errorMessage;
  res.status(errorCode).redirect(redirectPage);
};

/* redirect if no errors occure */
const happyRedirect = (res, req, path) => {
  req.session.error = null;
  res.redirect(path);
};

/* render if no errors occure */
const happyRender = (res, req, path, templateVars) => {
  req.session.error = null;
  res.render(path, templateVars);
};

module.exports = {
  generateRandomString,
  checkEmailExists,
  getUserIdfromEmail,
  getUserObjects,
  errorRedirect,
  happyRedirect,
  happyRender,
};