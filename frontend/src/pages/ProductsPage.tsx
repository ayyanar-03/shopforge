import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/products')
      .then(({ data }) => {
        setProducts(Array.isArray(data) ? data : data.data ?? []);
      })
      .catch(() => {
        setError('Failed to load products. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>;

  if (error) return (
    <div style={{ padding: '2rem' }}>
      <p style={{ color: '#c0392b' }}>{error}</p>
      <button onClick={() => window.location.reload()}>Retry</button>
    </div>
  );

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Products</h1>
      {products.length === 0 ? (
        <p style={{ color: '#666' }}>No products available yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {products.map((p) => (
            <Link to={`/products/${p.id}`} key={p.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: '1rem', height: '100%', boxSizing: 'border-box', transition: 'box-shadow 0.15s' }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)')}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
              >
                <h3 style={{ margin: '0 0 0.4rem' }}>{p.name}</h3>
                <p style={{ color: '#666', fontSize: '0.9rem', margin: '0 0 0.75rem' }}>
                  {p.description ? (p.description.length > 80 ? p.description.slice(0, 80) + '...' : p.description) : 'No description'}
                </p>
                <p style={{ fontWeight: 'bold', fontSize: '1.1rem', margin: '0 0 0.4rem' }}>${Number(p.price).toFixed(2)}</p>
                <p style={{ fontSize: '0.85rem', margin: 0, color: p.stock > 0 ? '#16a34a' : '#dc2626' }}>
                  {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
