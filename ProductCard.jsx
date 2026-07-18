import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  const stockLabel =
    product.stock === 0 ? 'Out of stock' : product.stock <= 5 ? `Only ${product.stock} left` : 'In stock';
  const stockClass = product.stock === 0 ? 'out' : product.stock <= 5 ? 'low' : '';

  return (
    <Link to={`/products/${product._id}`} className="product-card">
      <img
        className="product-card__image"
        src={product.image || 'https://placehold.co/400x400?text=No+Image'}
        alt={product.name}
        loading="lazy"
      />
      <div className="product-card__tag">{product.category}</div>
      <div className="product-card__name">{product.name}</div>
      <div className="product-card__footer">
        <span className="price-tag">${product.price.toFixed(2)}</span>
        <span className={`stock-note ${stockClass}`}>{stockLabel}</span>
      </div>
    </Link>
  );
}
