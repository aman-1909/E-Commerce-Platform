import { useEffect, useState } from 'react';
import { api } from '../api/client';

const EMPTY_PRODUCT = { name: '', description: '', price: '', category: '', stock: '', image: '', tags: '' };

export default function Admin() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function loadAll() {
    const [statsRes, productsRes, ordersRes] = await Promise.all([
      api.getAdminStats(),
      api.getProducts(),
      api.getAdminOrders(),
    ]);
    setStats(statsRes);
    setProducts(productsRes.products);
    setOrders(ordersRes.orders);
  }

  useEffect(() => {
    loadAll();
  }, []);

  function startEdit(product) {
    setEditingId(product._id);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      image: product.image || '',
      tags: (product.tags || []).join(', '),
    });
    setTab('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setForm(EMPTY_PRODUCT);
    setEditingId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        stock: Number(form.stock),
        image: form.image,
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };
      if (editingId) {
        await api.updateProduct(editingId, payload);
      } else {
        await api.createProduct(payload);
      }
      resetForm();
      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return;
    await api.deleteProduct(id);
    await loadAll();
  }

  async function handleStatusChange(orderId, status) {
    await api.updateOrderStatus(orderId, status);
    await loadAll();
  }

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
      <h1 style={{ fontSize: 32, marginBottom: 24 }}>Admin dashboard</h1>

      <div className="admin-tabs">
        {['overview', 'products', 'orders'].map((t) => (
          <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && stats && (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="label">Revenue</div>
            <div className="value">${stats.revenue.toFixed(2)}</div>
          </div>
          <div className="stat-card">
            <div className="label">Orders</div>
            <div className="value">{stats.orderCount}</div>
          </div>
          <div className="stat-card">
            <div className="label">Products</div>
            <div className="value">{stats.productCount}</div>
          </div>
          <div className="stat-card">
            <div className="label">Customers</div>
            <div className="value">{stats.userCount}</div>
          </div>
          {stats.lowStock.length > 0 && (
            <div className="stat-card" style={{ gridColumn: '1 / -1' }}>
              <div className="label">Low stock alert</div>
              <div style={{ marginTop: 10, fontSize: 14 }}>
                {stats.lowStock.map((p) => (
                  <div key={p._id} style={{ padding: '4px 0', color: 'var(--copper-light)' }}>
                    {p.name} — {p.stock} left
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'products' && (
        <>
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="field">
              <label>Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="field">
              <label>Category</label>
              <input
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Price ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Stock</label>
              <input
                type="number"
                required
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
            </div>
            <div className="field full">
              <label>Image URL</label>
              <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
            </div>
            <div className="field full">
              <label>Tags (comma-separated)</label>
              <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            </div>
            <div className="field full">
              <label>Description</label>
              <input
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {error && (
              <div className="form-error full" style={{ gridColumn: '1 / -1' }}>
                {error}
              </div>
            )}

            <div className="full" style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Update product' : 'Add product'}
              </button>
              {editingId && (
                <button type="button" className="btn" onClick={resetForm}>
                  Cancel edit
                </button>
              )}
            </div>
          </form>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>${p.price.toFixed(2)}</td>
                  <td>{p.stock}</td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    <button className="btn" onClick={() => startEdit(p)}>
                      Edit
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(p._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {tab === 'orders' && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td>#{o._id.slice(-8)}</td>
                <td>{o.user?.name || 'Unknown'}</td>
                <td>${o.total.toFixed(2)}</td>
                <td>
                  <select value={o.status} onChange={(e) => handleStatusChange(o._id, e.target.value)}>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
