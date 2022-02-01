import React, { Component } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { debounce } from "throttle-debounce";
import * as BooksAPI from "./BooksAPI";
import "./App.css";
import ListBooks from "./ListBooks";
import SearchBooks from "./SearchBooks";

const bookshelves = [
  { key: "currentlyReading", name: "Currently Reading" },
  { key: "wantToRead", name: "Want to Read" },
  { key: "read", name: "Read" },
];
class BooksApp extends Component {
  state = {
    myBooks: [],
    searchBooks: [],
    error: false,
  };
  componentDidMount = () => {
    BooksAPI.getAll()
      .then((books) => {
        this.setState({ myBooks: books });
      })
      .catch((err) => {
        console.log(err);
        this.setState({ error: true });
      });
  };
  moveBook = (book, shelf) => {
    BooksAPI.update(book, shelf).catch((err) => {
      console.log(err);
      this.setState({ error: true });
    });
    if (shelf === "none") {
      this.setState((prevState) => ({
        myBooks: prevState.myBooks.filter((b) => b.id !== book.id),
      }));
    } else {
      book.shelf = shelf;
      this.setState((prevState) => ({
        myBooks: prevState.myBooks.filter((b) => b.id !== book.id).concat(book),
      }));
    }
  };
  searchForBooks = debounce(300, false, (query) => {
    if (query.length > 0) {
      BooksAPI.search(query).then((books) => {
        if (books.error) {
          this.setState({ searchBooks: [] });
        } else {
          this.setState({ searchBooks: books });
        }
      });
    } else {
      this.setState({ searchBooks: [] });
    }
  });
  resetSearch = () => {
    this.setState({ searchBooks: [] });
  };

  render() {
    const { myBooks, searchBooks, error } = this.state;
    if (error) {
      return <div>Network error. Please try again later.</div>;
    }
    return (
      <div className="app">
        <Routes >
          <Route
            exact
            path="/"
            element={
              <ListBooks
                bookshelves={bookshelves}
                books={myBooks}
                onMove={this.moveBook}
              />
            }
          />
          <Route
            path="/search"
            element={
              <SearchBooks
                searchBooks={searchBooks}
                myBooks={myBooks}
                onSearch={this.searchForBooks}
                onMove={this.moveBook}
                onResetSearch={this.resetSearch}
              />
            }
          />
        </Routes>
      </div>
    );
  }
}

export default BooksApp;
