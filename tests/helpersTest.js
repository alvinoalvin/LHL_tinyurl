const { assert } = require('chai');
const helpers = require('../helper.js');
const testUsers = {
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
};
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.bleh.com",
    userID: "userRandomID"
  },
  "b2xVn1": {
    longURL: "http://www.blah.ca",
    userID: "user2RandomID"
  },
  "9sm5xd": {
    longURL: "http://www.blop.com",
    userID: "user2RandomID"
  },
  "9sm5x1": {
    longURL: "http://www.bloop.com",
    userID: "user2RandomID"
  },
};

describe('getUserIdfromEmail', function() {
  it('should return a user with valid email', function() {
    const user = helpers.getUserIdfromEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert.strictEqual(user, expectedOutput);
  });
  it('should return undefined for invalid email', function() {
    const user = helpers.getUserIdfromEmail("asdf@example.com", testUsers);
    const expectedOutput = undefined;
    // Write your assert statement here
    assert.strictEqual(user, expectedOutput);
  });
  it('should undefined for user with no email', function() {
    const user = helpers.getUserIdfromEmail("blah@example.com", testUsers);
    const expectedOutput = undefined;
    // Write your assert statement here
    assert.strictEqual(user, expectedOutput);
  });
});

describe('checkEmailExists', function() {
  it('should return true with email in database', function() {
    const user = helpers.checkEmailExists("user@example.com", testUsers);
    const expectedOutput = true;
    // Write your assert statement here
    assert.strictEqual(user, expectedOutput);
  });
  it('should return false for email not in database', function() {
    const user = helpers.checkEmailExists("asdf@example.com", testUsers);
    const expectedOutput = false;
    // Write your assert statement here
    assert.strictEqual(user, expectedOutput);
  });
  it('should return false for no email', function() {
    const user = helpers.checkEmailExists(undefined, testUsers);
    const expectedOutput = false;
    // Write your assert statement here
    assert.strictEqual(user, expectedOutput);
  });
});


describe('getUserObjects', function() {
  it('should return only objects belonging to user', function() {
    const user = helpers.getUserObjects("userRandomID", urlDatabase);
    const expectedOutput = {
      "b2xVn2": {
        longURL: "http://www.lighthouselabs.ca",
        userID: "userRandomID"
      },
      "9sm5xK": {
        longURL: "http://www.bleh.com",
        userID: "userRandomID"
      },
    };
    // Write your assert statement here
    assert.deepEqual(user, expectedOutput);
  });
  it('should return empty object for no user', function() {
    const user = helpers.getUserObjects(null, urlDatabase);
    const expectedOutput = {};
    // Write your assert statement here
    assert.deepEqual(user, expectedOutput);
  });
  it('should return no objects for user with no objects', function() {
    const user = helpers.getUserObjects("blah@example.com", urlDatabase);
    const expectedOutput = {};
    // Write your assert statement here
    assert.deepEqual(user, expectedOutput);
  });
});