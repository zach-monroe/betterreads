import express from "express";
import pg from "pg";
import bodyParser from "body-parser";
import axios from "axios";
import { password } from "./config.js";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

const db = new pg.Client({
  host: "localhost",
  database: "books",
  user: "postgres",
  password,
  port: 5432,
});

db.connect();

app.get("/", async (req, res) => {
  let result;

  if (req.query.q) {
    if (req.query.q == "rating") {
      result = await db.query(
        "SELECT * FROM read INNER JOIN isbn ON read.id = isbn.book_id ORDER BY rating DESC",
      );
    } else if (req.query.q == "author") {
      result = await db.query(
        "SELECT * FROM read INNER JOIN isbn ON read.id = isbn.book_id ORDER BY author_lname",
      );
    }
  } else {
    result = await db.query(
      "SELECT * FROM read INNER JOIN isbn ON read.id = isbn.book_id",
    );
  }

  const books = result.rows;
  res.render("index.ejs", { books: books });
});

app.get("/new", async (req, res) => {
  res.render("new.ejs");
});

app.post("/add", async (req, res) => {
  console.log(req.body);
  //For adding the users input into the database
  const title = req.body.title;
  const notes = req.body.notes;
  const author_fname = req.body.author_fname;
  const author_lname = req.body.author_lname;
  const rating = req.body.rating;

  //API request for getting the ISBN
  const urlTitle = title.toLowerCase().replace(/ /g, "+");
  const urlAuthor = author_lname.toLowerCase();
  const isbnGet = await axios.get(
    "https://openlibrary.org/search.json?title=" +
      urlTitle +
      "&author=" +
      urlAuthor,
  );
  const isbnResult = isbnGet.data;

  if (
    isbnResult.docs &&
    isbnResult.docs.length > 0 &&
    isbnResult.docs[0].isbn
  ) {
    const isbn = JSON.parse(isbnResult.docs[0].isbn[0]);
    try {
      const readResult = await db.query(
        "INSERT INTO read (author_lname, title, notes, rating, author_fname) VALUES ($1, $2, $3, $4, $5) RETURNING (id)",
        [author_lname, title, notes, rating, author_fname],
      );

      const id = readResult.rows[0].id;

      const isbnPost = await db.query(
        "INSERT INTO isbn (book_id, book_isbn) VALUES ($1, $2)",
        [id, isbn],
      );
    } catch (err) {
      console.log(err.body);
    }
    res.redirect("/");
  } else {
    res.render("new.ejs", {
      books: [req.body],
      error: "Cannot find your entry!",
    });
  }
});

// NOTE: to fully optimize - "/add" functions should be broken up into individual functions.
// this would also tidy up the "/update" endpoint

app.post("/edit", async (req, res) => {
  const id = req.body.bookId;
  const result = await db.query(
    "SELECT * FROM read INNER JOIN isbn ON read.id = isbn.book_id WHERE read.id = ($1)",
    [id],
  );
  const books = result.rows;
  console.log(books);
  res.render("new.ejs", { books: books });
});

app.post("/update", async (req, res) => {
  const title = req.body.title;
  const notes = req.body.notes;
  const author_fname = req.body.author_fname;
  const author_lname = req.body.author_lname;
  const rating = req.body.rating;
  const id = req.body.id;

  try {
    const readResult = await db.query(
      "UPDATE read SET author_lname = $1, title = $2, notes = $3, rating = $4, author_fname = $5 WHERE id = $6",
      [author_lname, title, notes, rating, author_fname, id],
    );
  } catch (err) {
    console.log(err.body);
  }

  res.redirect("/");

  res.render("new.ejs", {
    books: [req.body],
    error: "Cannot find your entry!",
  });
});

app.post("/delete", async (req, res) => {
  const id = req.body.bookId;
  try {
    await db.query(
      "DELETE FROM read USING isbn WHERE id = isbn.book_id AND id = ($1)",
      [id],
    );
  } catch (err) {
    console.log(err);
  }
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server is live at port ${port}`);
});

// TODO: Add styling and layout
// TODO: Give users the option to change their isbn number if they dislike the rendered picture?
//  (maybe an advanced settings dropdown that allows users to add isbn numbers on the "/edit" path?)
//  this functionality should be available if the ISBN information cannot be found on the database as well.
