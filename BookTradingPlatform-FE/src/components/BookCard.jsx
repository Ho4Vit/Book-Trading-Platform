import React from "react";
import { Link } from "react-router-dom";
import "./BookCard.css";

function BookCard({ book }) {
    return (
        <Link to={`/books/${book.id}`} className="book-card">
            <img src={book.coverImage} alt={book.title} />
            <h3>{book.title}</h3>
            <p>{book.author}</p>
            <p className="price">{book.price.toLocaleString()} đ</p>
        </Link>
    );
}

export default BookCard;
