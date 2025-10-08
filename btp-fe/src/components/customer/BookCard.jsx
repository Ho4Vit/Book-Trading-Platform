// src/components/BookCard.jsx
import React from "react";

const BookCard = ({ book }) => {
    return (
        <div className="bg-white shadow-md rounded-2xl overflow-hidden hover:shadow-lg transition-transform transform hover:-translate-y-1">
            <img
                src={
                    book.coverImage && book.coverImage !== "string"
                        ? book.coverImage
                        : "https://via.placeholder.com/200x300?text=No+Image"
                }
                alt={book.title}
                className="w-full h-72 object-cover"
            />
            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 truncate">
                    {book.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">by {book.author}</p>

                {book.categoryNames && book.categoryNames.length > 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                        {book.categoryNames.join(", ")}
                    </p>
                )}

                <p className="text-indigo-600 font-bold mt-3">${book.price}</p>

                <p className="text-xs text-gray-400 mt-1">
                    {book.stock > 0 ? `In stock (${book.stock})` : "Out of stock"}
                </p>
            </div>
        </div>
    );
};

export default BookCard;
