import banner from '../assets/banner.jpg';

const HeroBanner = () => {
    return (
        <div className="relative">
            <img src={banner} alt="Banner" className="w-full h-[400px] object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <h2 className="text-white text-4xl font-bold">Chào mừng đến với Book Store</h2>
            </div>
        </div>
    );
};

export default HeroBanner;
