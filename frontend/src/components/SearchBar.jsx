import React from 'react';
import { Search, Filter, ArrowUpDown, X } from 'lucide-react';

const CATEGORIES = [
  'All Categories',
  'Electronics',
  'Fashion',
  'Books',
  'Home',
];

const SearchBar = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  onClearFilters,
}) => {
  const hasActiveFilters =
    Boolean(searchQuery) ||
    (selectedCategory && selectedCategory !== 'All Categories') ||
    Boolean(sortBy);

  return (
    <div className="search-filter-container">
      {/* Search Input */}
      <div className="search-input-wrapper">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          id="product-search-input"
          placeholder="Search products by name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
          aria-label="Search products"
        />
        {searchQuery && (
          <button
            type="button"
            className="clear-search-btn"
            onClick={() => onSearchChange('')}
            aria-label="Clear search input"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filter Controls Row */}
      <div className="filter-controls-group">
        {/* Category Dropdown */}
        <div className="select-wrapper">
          <Filter size={16} className="select-icon" />
          <select
            id="category-filter-select"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="filter-select"
            aria-label="Filter by category"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Dropdown (Bonus Challenge +10 Marks) */}
        <div className="select-wrapper">
          <ArrowUpDown size={16} className="select-icon" />
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="filter-select"
            aria-label="Sort products"
          >
            <option value="">Sort: Featured</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="btn-clear-filters"
            title="Clear all active filters"
          >
            <X size={14} />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
