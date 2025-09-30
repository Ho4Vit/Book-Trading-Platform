import React from "react";

const SearchBar = () => {
    return (
        <div className="search-bar">
            <input type="text" placeholder="Tìm kiếm sách..."/>
            <i className="fas fa-search search-icon"></i>
        </div>

    );
};

export default SearchBar;
