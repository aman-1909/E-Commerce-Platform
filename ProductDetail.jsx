import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setProduct(null);
    setQty(1);
    api.getProduct(id).then(({ product, similar }) => {
      setProduct(product);
      setSimilar(similar);
    });
  }, [id]);

  async function handleAddToCart() {
    if (!user) {
      navigate('/login');
      return;
    }
    setError('');
    setAdding(true);
    try {
      await addToCart(product._id, qty);
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  }

  if (!product) return <div className="loading-text">Loading...</div>;

  return (
    <div className="container">
      <div className="detail-grid">
        <img src={product.image || 'https://placehold.co/600x600?text=No+Image'} alt={product.name} />
        <div className="detail-info">
          <div className="tag">{product.category}</div>
          <h1>{product.name}</h1>
          <span className="price-tag">${product.price.toFixed(2)}</span>
          <p className="desc">{product.description}</p>

          {error && <div className="form-error">{error}</div>}

          {product.stock === 0 ? (
            <div className="form-error">This item is currently out of stock.</div>
          ) : (
            <div className="qty-row">
              <div className="qty-control">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))}>+</button>
              </div>
              <span className="stock-note">{product.stock} available</span>
            </div>
          )}

          <button
            className="btn btn-primary"
            disabled={product.stock === 0 || adding}
            onClick={handleAddToCart}
          >
            {adding ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>

      {similar.length > 0 && (
        <>
          <div className="section-heading">
            <h2>You might also like</h2>
            <span>Similar in {product.category}</span>
          </div>
          <div className="product-grid" style={{ marginBottom: 60 }}>
            {similar.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
