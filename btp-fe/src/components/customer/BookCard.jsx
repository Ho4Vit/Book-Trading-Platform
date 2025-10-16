// src/components/BookingCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function BookingCard({ image, title, author, price, stock ,onAddToCart }) {
    return (
        <motion.div
            whileHover={{ scale: 1.03 }}
            className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all border border-gray-100"
        >
            <div className="aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden mb-4">
                {image ? (
                    <img src={image} alt={title} className="w-full h-full object-cover" />
                ) : null}
            </div>
            <h3 className="font-medium text-[#1A1A1A] truncate">{title}</h3>
            <p className="text-sm text-gray-500 truncate">{author}</p>
            <p className="text-[#D97B48] font-semibold mt-2">{price}</p>
            <p className="text-xs text-gray-400 mt-1">
                {stock > 0 ? `In stock (${stock})` : "Out of stock"}
            </p>
            <Button
                variant="default"
                className="mt-3 w-full bg-[#4A6FA5] hover:bg-[#3B5B86] text-white rounded-full"
                onClick={onAddToCart}
            >
                Thêm vào giỏ hàng
            </Button>
        </motion.div>
    );
}