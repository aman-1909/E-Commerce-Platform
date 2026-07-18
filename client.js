const BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload, auth: false }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload, auth: false }),
  me: () => request('/auth/me'),

  getProducts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/products${qs ? `?${qs}` : ''}`, { auth: false });
  },
  getCategories: () => request('/products/categories', { auth: false }),
  getProduct: (id) => request(`/products/${id}`, { auth: false }),

  getCart: () => request('/cart'),
  addToCart: (productId, quantity = 1) => request('/cart/add', { method: 'POST', body: { productId, quantity } }),
  updateCartItem: (productId, quantity) => request('/cart/update', { method: 'PUT', body: { productId, quantity } }),
  removeCartItem: (productId) => request(`/cart/remove/${productId}`, { method: 'DELETE' }),

  checkout: (shippingAddress) => request('/orders/checkout', { method: 'POST', body: { shippingAddress } }),
  getOrders: () => request('/orders'),

  getRecommendations: () => request('/recommendations'),

  // Admin
  getAdminStats: () => request('/admin/stats'),
  createProduct: (payload) => request('/admin/products', { method: 'POST', body: payload }),
  updateProduct: (id, payload) => request(`/admin/products/${id}`, { method: 'PUT', body: payload }),
  deleteProduct: (id) => request(`/admin/products/${id}`, { method: 'DELETE' }),
  getAdminOrders: () => request('/admin/orders'),
  updateOrderStatus: (id, status) => request(`/admin/orders/${id}/status`, { method: 'PUT', body: { status } }),
};
