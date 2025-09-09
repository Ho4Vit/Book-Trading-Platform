import React from 'react';
import { useNavigate } from 'react-router-dom';

const BookCard = ({ book }) => {
    const navigate = useNavigate();

    return (
        <div style={{ border: '1px solid #ddd', padding: '1rem', margin: '1rem' }}>
            <img src={book.coverImage} alt={book.title} style={{ width: '150px', height: '200px' }} />
            <h3>{book.title}</h3>
            <p>Tác giả: {book.author}</p>
            <p>Giá: {book.price.toLocaleString()}đ</p>
            <button onClick={() => navigate(`/book/${book.id}`)}>Xem chi tiết</button>
        </div>
    );
};

export default BookCard;
