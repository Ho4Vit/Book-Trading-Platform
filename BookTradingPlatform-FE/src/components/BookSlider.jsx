import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import BookCard from "./BookCard";
import "./BookSlider.css"; // css cùng folder với file này

function BookSlider({ books }) {
    if (!Array.isArray(books)) return null;

    return (
        <Swiper spaceBetween={10} slidesPerView={4}>
            {books.map((book) => (
                <SwiperSlide key={book.id}>
                    <BookCard book={book} />
                </SwiperSlide>
            ))}
        </Swiper>
    );
}

export default BookSlider;
