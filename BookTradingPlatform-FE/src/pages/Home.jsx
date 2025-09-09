import React, { useEffect, useState } from 'react';
import { getAllBooks } from '../services/bookService';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
    const [books, setBooks] = useState([]);

    useEffect(() => {
        getAllBooks()
            .then(response => setBooks(response.data))
            .catch(error => console.error('Error loading books:', error));
    }, []);

    return (
        <div className="home">
            <h2>Sách mới cập nhật</h2>
            <div className="book-list">
                {books.map(book => (
                    <Link key={book.id} to={`/book/${book.id}`} className="book-card">
                        <h4>{book.title}</h4>
                        <p>{book.author}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Home;
