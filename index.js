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
  password: "password here",
  port: 5432,
});

db.connect();

app.get("/", async (req, res) => {
  const result = await db.query(
    "SELECT * FROM read INNER JOIN isbn ON read.id = isbn.book_id",
  );
  console.log(result.rows);
  const books = result.rows;
  const isbn = await db.query("SELECT * FROM isbn");
  res.render("index.ejs", { books: books });
});
app.get("/new", async (req, res) => {
  res.render("new.ejs");
});
app.post("/add", async (req, res) => {
  console.log(req.body);
  // db query for adding a book to read
  //set up html form
  //  naming:
  //  const title = req.body.title
});

app.listen(port, () => {
  console.log(`Server is live at port ${port}`);
});

// TODO: Add DB Query for adding a book to the read database.returning author name, title and book id.
// TODO: Format the "/add" url endpoint to also retrieve the isbn number from the title and author information using axios
// TODO: Add the isbn number to the isbn table.
// TODO: add endpoints for differing sorting methods and modify the query accordingly. (Maybe use a variable to keep one endpoint and have it be set by the req.body?)
// TODO: set up deletion handling
// TODO: set up a put request for editing a post. (Might need to make a hidden html element that stores the id for editing and deleting.)
