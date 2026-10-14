import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PackageSearch, AlertCircle, RefreshCw, ShoppingBag } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import { fetchProducts } from '../services/api';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Sync initial state from URL query parameters (e.g. /products?category=Electronics)
  const initialCategory = searchParams.get('category') || 'All Categories';
  const initialSearch = searchParams.get('search') || '';
  const initialSort = searchParams.get('sort') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState(initialSort);

  // Update URL search parameters when filters change
  const updateURLParams = useCallback((search, category, sort) => {
    const params = {};
    if (search && search.trim()) params.search = search.trim();
    if (category && category !== 'All Categories') params.category = category;
    if (sort) params.sort = sort;
    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  // Fetch products from backend dynamically
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const data = await fetchProducts({
        search: searchQuery,
        category: selectedCategory,
        sort: sortBy,
      });

      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching products:', err.message);
      setError('Something went wrong while loading products. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, sortBy]);

  // Trigger search on debounce or filter change
  useEffect(() => {
    const timer = setTimeout(() => {
      updateURLParams(searchQuery, selectedCategory, sortBy);
      loadProducts();
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, sortBy, loadProducts, updateURLParams]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Categories');
    setSortBy('');
  };

  return (
    <div className="products-page-container">
      {/* Header Banner */}
      <section className="catalog-header">
        <div className="catalog-header-text">
          <h1>Product Catalog</h1>
          <p>Discover top-rated gear, tech essentials, apparel, and lifestyle items.</p>
        </div>
      </section>

      {/* Task 7: Search & Category Filter Bar */}
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onClearFilters={handleClearFilters}
      />

      {/* Catalog Results Header */}
      <div className="catalog-results-header">
        <span className="results-count">
          Showing <strong>{products.length}</strong> {products.length === 1 ? 'product' : 'products'}
          {selectedCategory !== 'All Categories' && (
            <span> in <em>{selectedCategory}</em></span>
          )}
          {searchQuery && (
            <span> matching "<em>{searchQuery}</em>"</span>
          )}
        </span>
      </div>

      {/* State 1: Loading State */}
      {loading && (
        <div className="state-container loading-state-box">
          <div className="spinner"></div>
          <p className="state-message">Loading products from ShopKart catalog...</p>
        </div>
      )}

      {/* State 2: Error State */}
      {!loading && error && (
        <div className="state-container error-state-box">
          <AlertCircle size={44} className="state-icon text-danger" />
          <h3 className="state-title">Error Loading Catalog</h3>
          <p className="state-message">{error}</p>
          <button
            type="button"
            onClick={loadProducts}
            className="btn-retry"
          >
            <RefreshCw size={16} />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* State 3: Empty State */}
      {!loading && !error && products.length === 0 && (
        <div className="state-container empty-state-box">
          <PackageSearch size={52} className="state-icon text-muted" />
          <h3 className="state-title">No products found</h3>
          <p className="state-message">
            We couldn't find any products matching your current search or category filter.
          </p>
          {(searchQuery || selectedCategory !== 'All Categories' || sortBy) && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="btn-clear-empty"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Task 6: Dynamic Product Card Grid using .map() */}
      {!loading && !error && products.length > 0 && (
        <section className="product-grid" aria-label="Product catalogue">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </section>
      )}
    </div>
  );
};

export default Products;
