import axiosClient from '../config/axiosClient';

export const getAllBooks = () => {
    return axiosClient.get('/v1/books/all'); // sửa path nếu BE khác
};

export const getBookById = (id) => {
    return axiosClient.get(`/v1/books/${id}`);
};
