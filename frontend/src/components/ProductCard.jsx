import React from 'react';
import { Link } from 'react-router-dom';
import { Tag, Package, ArrowRight, Eye } from 'lucide-react';

const ProductCard = ({ product }) => {
  if (!product) return null;

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <article className="product-card" id={`product-${product._id}`}>
      {/* Product Image */}
      <div className="product-image-container">
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          loading="lazy"
          onError={(e) => {
            // Fallback image if broken URL
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80';
          }}
        />
        <span className="product-category-pill">
          <Tag size={12} />
          <span>{product.category}</span>
        </span>
      </div>

      {/* Product Body */}
      <div className="product-info">
        <h3 className="product-title" title={product.name}>
          {product.name}
        </h3>

        {/* Price & Stock */}
        <div className="product-pricing-row">
          <div className="product-price">
            ₹{product.price ? product.price.toLocaleString('en-IN') : '0'}
          </div>

          <div
            className={`stock-badge ${
              isOutOfStock ? 'stock-out' : isLowStock ? 'stock-low' : 'stock-in'
            }`}
          >
            <Package size={12} />
            <span>
              {isOutOfStock
                ? 'Out of Stock'
                : `${product.stock} units left`}
            </span>
          </div>
        </div>

        {/* View Details Action */}
        <Link
          to={`/products/${product._id}`}
          className="btn-view-details"
          id={`view-details-${product._id}`}
        >
          <span>View Details</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
};

export default ProductCard;
