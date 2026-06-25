import { useEffect, useState } from 'react';
import api from '../api';

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: { name: string };
}

interface Order {
  id: number;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders').then(({ data }) => {
      setOrders(Array.isArray(data) ? data : data.data ?? []);
      setLoading(false);
    });
  }, []);

  if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>;

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', padding: '1rem' }}>
      <h1>Orders</h1>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Order #{order.id}</span>
              <span style={{ textTransform: 'capitalize', color: order.status === 'confirmed' ? 'green' : '#888' }}>
                {order.status}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#888' }}>{new Date(order.createdAt).toLocaleString()}</p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {order.items.map((item) => (
                <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                  <span>{item.product.name} x {item.quantity}</span>
                  <span>${(Number(item.price) * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <p style={{ fontWeight: 'bold', textAlign: 'right' }}>Total: ${Number(order.total).toFixed(2)}</p>
          </div>
        ))
      )}
    </div>
  );
}
