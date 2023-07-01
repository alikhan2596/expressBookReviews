const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

const doesExist = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username
  });
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
}

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!doesExist(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registred. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  axios.get('http://localhost:5000/')
    .then(response => {
      return res.status(200).json(response.data);
    })
    .catch(error => {
      return res.status(500).json({ message: "Error retrieving book list" });
    });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  // Define an async function to handle the request
  async function getBookDetails() {
    try {
      const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
      const book = response.data;

      if (book) {
        return res.status(200).json(book);
      } else {
        return res.status(404).json({ message: "Book not found" });
      }
    } catch (error) {
      return res.status(500).json({ message: "Error retrieving book details" });
    }
  }

  // Call the async function to handle the request
  getBookDetails();
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;

  axios.get('http://localhost:5000/')
    .then(response => {
      const booksByAuthor = response.data.filter(book => book.author === author);

      if (booksByAuthor.length > 0) {
        return res.status(200).json(booksByAuthor);
      } else {
        return res.status(404).json({ message: "No books found by the author" });
      }
    })
    .catch(error => {
      return res.status(500).json({ message: "Error retrieving book details" });
    });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;

  axios.get('http://localhost:5000/')
    .then(response => {
      const booksWithTitle = response.data.filter(book => book.title === title);

      if (booksWithTitle.length > 0) {
        return res.status(200).json(booksWithTitle);
      } else {
        return res.status(404).json({ message: "No books found with the title" });
      }
    })
    .catch(error => {
      return res.status(500).json({ message: "Error retrieving book details" });
    });
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = Object.values(books).find((book) => book.isbn === isbn);

  if (book && book.reviews) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Book reviews not found" });
  }
});

module.exports.general = public_users;
