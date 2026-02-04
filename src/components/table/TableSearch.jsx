import React, { useState } from "react";

const TableSearch = ({ onSearch, placeholder }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    // Real-time search (no need to press enter)
    onSearch(value);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full md:w-auto">
      <div className="flex items-center">
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleChange}
          className="h-10 border border-gray-300 rounded-l-lg px-3 w-full md:w-64
            focus:ring-1 focus:ring-primary/20 focus:border-primary placeholder:text-sm"
        />
        <button
          type="submit"
          className="h-10 px-4 border border-l-0 border-gray-300 rounded-r-lg
            bg-gray-50 hover:bg-gray-100 transition flex items-center justify-center"
        >
          <i className="fas fa-search text-gray-600"></i>
        </button>
      </div>
    </form>
  );
};

export default TableSearch;
