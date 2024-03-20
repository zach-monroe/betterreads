import express from "express";
import pg from "pg";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

const db = new pg.Client({
  host: "localhost",
  database: "books",
  user: "postgres",
  password: "your password here",
  port: 5432,
});

db.connect();

app.get("/", async (req, res) => {
  const result = await db.query(
    "SELECT * FROM read INNER JOIN isbn ON read.id = isbn.book_id",
  );
  console.log(result.rows);
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
  let id;
  try {
    const readResult = await db.query(
      "INSERT INTO read (author_lname, title, notes, rating, author_fname) VALUES ($1, $2, $3, $4, $5) RETURNING (id)",
      [author_lname, title, notes, rating, author_fname],
    );

    id = readResult.rows[0].id;
  } catch (err) {
    console.log(err.body);
  }

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
  const isbn = JSON.parse(isbnResult.docs[0].isbn[0]);
  try {
    await db.query("INSERT INTO isbn (book_id, book_isbn) VALUES ($1, $2)", [
      id,
      isbn,
    ]);
  } catch (err) {
    console.log(err.body);
  }
  res.redirect("/");

  // FIX: Edge case - user accidentally inputs data that yields no result from search API.
  // should stop the user from posting to the database and leave their input in the form.
  // Should inform them the book they want to log does not exist.
  // Maybe reconfigure so it searches for the isbn BEFORE adding to "read" database - preventing unneccessary insertion and deletion.
});

app.listen(port, () => {
  console.log(`Server is live at port ${port}`);
});

// TODO: add endpoints for differing sorting methods and modify the query accordingly.
//    (Maybe use a variable to keep one endpoint and have it be set by the req.body?)
//
// TODO: set up deletion handling
// TODO: set up a put request for editing a post. (Might need to make a hidden html element that stores the id for editing and deleting.)
