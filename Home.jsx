import { useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('');

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (category !== 'all') params.category = category;
      if (sort) params.sort = sort;
      const { products } = await api.getProducts(params);
      setProducts(products);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort]);

  useEffect(() => {
    api.getCategories().then(({ categories }) => setCategories(categories));
  }, []);

  useEffect(() => {
    const timeout = setTimeout(loadProducts, 250);
    return () => clearTimeout(timeout);
  }, [loadProducts]);

  useEffect(() => {
    if (user) {
      api.getRecommendations().then(({ recommendations }) => setRecommendations(recommendations)).catch(() => {});
    }
  }, [user]);

  return (
    <div>
      <div className="hero">
        <div className="container">
          <div className="hero__eyebrow">The full catalog</div>
          <h1>Everything you need, curated with care.</h1>
          <p>Electronics, apparel, home goods, and more — search, filter, and check out in seconds.</p>
        </div>
      </div>

      <div className="container">
        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="">Sort: Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
          <span className="result-count">{loading ? 'Searching...' : `${products.length} items`}</span>
        </div>

        {recommendations.length > 0 && (
          <>
            <div className="section-heading">
              <h2>Recommended for you</h2>
              <span>Based on your past orders</span>
            </div>
            <div className="rec-strip" style={{ marginBottom: 48 }}>
              {recommendations.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </>
        )}

        {loading ? (
          <div className="loading-text">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <h2>No products found</h2>
            <p>Try a different search term or category.</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
