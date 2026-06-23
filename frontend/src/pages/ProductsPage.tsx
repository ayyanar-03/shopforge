import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string | null;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products').then(({ data }) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Products</h1>
      {products.length === 0 ? (
        <p>No products available.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {products.map((p) => (
            <Link to={`/products/${p.id}`} key={p.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: '1rem' }}>
                <h3>{p.name}</h3>
                <p style={{ color: '#666' }}>{p.description.slice(0, 80)}...</p>
                <p style={{ fontWeight: 'bold' }}>${Number(p.price).toFixed(2)}</p>
                <p style={{ fontSize: '0.85rem', color: p.stock > 0 ? 'green' : 'red' }}>
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
