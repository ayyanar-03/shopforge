import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

interface CartItem {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
  };
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCart = async () => {
    const { data } = await api.get('/cart');
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const removeItem = async (id: number) => {
    await api.delete(`/cart/${id}`);
    fetchCart();
  };

  const checkout = async () => {
    try {
      await api.post('/orders');
      navigate('/orders');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Checkout failed');
    }
  };

  if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>;

  const total = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '1rem' }}>
      <h1>Cart</h1>
      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {items.map((item) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #eee' }}>
              <div>
                <strong>{item.product.name}</strong>
                <p>${Number(item.product.price).toFixed(2)} x {item.quantity}</p>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold' }}>${(Number(item.product.price) * item.quantity).toFixed(2)}</span>
                <button onClick={() => removeItem(item.id)}>Remove</button>
              </div>
            </div>
          ))}
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Total: ${total.toFixed(2)}</span>
            <button onClick={checkout} style={{ padding: '0.5rem 2rem', fontSize: '1rem' }}>Place Order</button>
          </div>
        </>
      )}
    </div>
  );
}
