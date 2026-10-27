import React from "react";
import { FaSearch, FaFilter } from "react-icons/fa";

const genresList = ["All", "Action", "Sci-Fi", "Drama", "Adventure", "Crime", "Biography", "History", "Comedy"];

const SearchAndFilter = ({ searchTerm, setSearchTerm, selectedGenre, setSelectedGenre }) => {
  return (
    <div className="glass-panel p-3 rounded-4 mb-4">
      <div className="row g-3 align-items-center">
        {/* Search Input */}
        <div className="col-12 col-md-7">
          <div className="input-group">
            <span className="input-group-text bg-dark border-secondary text-secondary">
              <FaSearch />
            </span>
            <input
              type="text"
              className="form-control bg-dark text-light border-secondary"
              placeholder="Search movies by title, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="btn btn-dark border-secondary text-secondary"
                onClick={() => setSearchTerm("")}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Genre Filter Pills */}
        <div className="col-12 col-md-5">
          <div className="d-flex align-items-center gap-2 overflow-auto py-1" style={{ whiteSpace: "nowrap" }}>
            <FaFilter className="text-secondary me-1" size={14} />
            {genresList.map((genre) => (
              <button
                key={genre}
                className={`btn btn-sm rounded-pill px-3 ${
                  selectedGenre === genre ? "btn-danger fw-bold" : "btn-dark text-secondary border-secondary"
                }`}
                onClick={() => setSelectedGenre(genre)}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilter;
