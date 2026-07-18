import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { api } from '../api/client';

export default function Cart() {
  const { cart, total, updateItem, removeItem, refreshCart } = useCart();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [address, setAddress] = useState({ line1: '', city: '', state: '', zip: '', country: '' });

  const validItems = cart.items.filter((i) => i.product);

  async function handleCheckout() {
    setError('');
    setPlacing(true);
    try {
      const { order, mockMode, message } = await api.checkout(address);
      await refreshCart();
      navigate('/orders', { state: { justPlaced: order._id, mockMode, message } });
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  }

  if (validItems.length === 0) {
    return (
      <div className="container">
        <div className="empty-state">
          <h2>Your cart is empty</h2>
          <p>Browse the catalog and add something you like.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 20, display: 'inline-block' }}>
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="section-heading" style={{ marginTop: 40 }}>
        <h2>Your cart</h2>
        <span>{validItems.length} item(s)</span>
      </div>

      <div className="cart-layout">
        <div>
          {validItems.map((item) => (
            <div className="cart-row" key={item.product._id}>
              <img src={item.product.image || 'https://placehold.co/100x100'} alt={item.product.name} />
              <div>
                <div style={{ fontWeight: 600 }}>{item.product.name}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>${item.product.price.toFixed(2)} each</div>
              </div>
              <div className="qty-control">
                <button onClick={() => updateItem(item.product._id, item.quantity - 1)}>−</button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => updateItem(item.product._id, item.quantity + 1)}
                  disabled={item.quantity >= item.product.stock}
                >
                  +
                </button>
              </div>
              <button className="btn btn-danger" onClick={() => removeItem(item.product._id)}>
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3 style={{ marginBottom: 18 }}>Order summary</h3>
          <div className="cart-summary-row">
            <span>Subtotal</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="cart-summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="cart-summary-row total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <div style={{ margin: '20px 0' }}>
            <div className="field">
              <label>Shipping address</label>
              <input
                type="text"
                placeholder="Street address"
                value={address.line1}
                onChange={(e) => setAddress({ ...address, line1: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="City"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '1px solid var(--line)',
                  color: 'var(--ivory)',
                  padding: '11px 14px',
                  borderRadius: 3,
                  fontSize: 14,
                  marginTop: 8,
                }}
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
              />
              <input
                type="text"
                placeholder="ZIP"
                style={{
                  width: 90,
                  background: 'transparent',
                  border: '1px solid var(--line)',
                  color: 'var(--ivory)',
                  padding: '11px 14px',
                  borderRadius: 3,
                  fontSize: 14,
                  marginTop: 8,
                }}
                value={address.zip}
                onChange={(e) => setAddress({ ...address, zip: e.target.value })}
              />
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}

          <button className="btn btn-primary btn-block" onClick={handleCheckout} disabled={placing}>
            {placing ? 'Placing order...' : 'Checkout'}
          </button>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>
            Payments run through Stripe in test mode — no real charge is made.
          </p>
        </div>
      </div>
    </div>
  );
}
