import React from "react";

const Search = ({searchTerm, setSearchTerm}) => {
    return (
        <div className="search">
            <div>
                <img src="search.svg" alt="Search" />

                <input
                type="text"
                placeholder="Search Your Kdramas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
    )
}

export default Search;