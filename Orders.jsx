import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../api/client';

export default function Orders() {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getOrders().then(({ orders }) => setOrders(orders)).finally(() => setLoading(false));
  }, []);

  const justPlacedMsg = location.state?.message;

  return (
    <div className="container">
      <div className="section-heading" style={{ marginTop: 40 }}>
        <h2>Your orders</h2>
        <span>{orders.length} order(s)</span>
      </div>

      {justPlacedMsg && <div className="form-success">{justPlacedMsg}</div>}

      {loading ? (
        <div className="loading-text">Loading...</div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <h2>No orders yet</h2>
          <p>Your order history will show up here after checkout.</p>
        </div>
      ) : (
        <div style={{ paddingBottom: 60 }}>
          {orders.map((order) => (
            <div key={order._id} style={{ border: '1px solid var(--line)', borderRadius: 3, padding: 22, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>Order #{order._id.slice(-8)}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <span className={`badge ${order.status}`}>{order.status}</span>
              </div>
              {order.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '6px 0' }}>
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--line)',
                  marginTop: 10,
                  paddingTop: 10,
                  fontWeight: 600,
                }}
              >
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
