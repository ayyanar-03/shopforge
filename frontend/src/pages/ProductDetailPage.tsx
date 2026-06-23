import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string | null;
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/products/${id}`).then(({ data }) => setProduct(data));
  }, [id]);

  const addToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await api.post('/cart', { productId: product!.id, quantity });
      setMessage('Added to cart!');
      setTimeout(() => setMessage(''), 2000);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  if (!product) return <p style={{ padding: '2rem' }}>Loading...</p>;

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '1rem' }}>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${Number(product.price).toFixed(2)}</p>
      <p style={{ color: product.stock > 0 ? 'green' : 'red' }}>
        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
      </p>
      {product.stock > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '1rem' }}>
          <input
            type="number"
            min={1}
            max={product.stock}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            style={{ width: 60 }}
          />
          <button onClick={addToCart}>Add to Cart</button>
        </div>
      )}
      {message && <p style={{ marginTop: '0.5rem', color: 'green' }}>{message}</p>}
    </div>
  );
}
