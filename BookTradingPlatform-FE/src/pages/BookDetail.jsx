import { useParams } from 'react-router-dom';

const BookDetail = () => {
    const { id } = useParams();

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">Chi tiết sách #{id}</h2>
            <p>Thông tin chi tiết về sách sẽ hiển thị ở đây.</p>
        </div>
    );
};

export default BookDetail;
