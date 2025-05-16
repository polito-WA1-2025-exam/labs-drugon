import React, { useState, useEffect } from 'react';
import { getUserOrders, deleteOrder } from '../api';
import OrderTable from '../components/OrderTable';

export default function CartPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      console.log('Loading orders...');
      const data = await getUserOrders();
      console.log('Orders loaded:', data);
      setOrders(data);
      setError('');
    } catch (err) {
      console.error('Error in loadOrders:', err);
      setError(`Failed to load orders: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      setError(''); // Clear any previous errors
      const result = await deleteOrder(orderId);
      if (result.success) {
        await loadOrders();
      } else {
        setError(result.message || 'Failed to delete order');
      }
    } catch (err) {
      console.error('Error in handleDelete:', err);
      setError(err.message || 'Failed to delete order');
    }
  };

  if (loading) {
    return <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>Loading orders...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h2 style={{ marginBottom: '2rem', color: '#333' }}>Your Orders</h2>
      
      {error && (
        <div style={{ 
          color: '#dc3545', 
          padding: '1rem', 
          marginBottom: '1rem', 
          backgroundColor: '#f8d7da', 
          borderRadius: '4px',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}
      
      {!error && orders.length === 0 && (
        <div style={{ 
          color: '#666', 
          padding: '1rem', 
          marginBottom: '1rem', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '4px',
          border: '1px solid #e9ecef'
        }}>
          No orders found. Start by creating a new order!
        </div>
      )}
      
      {orders.length > 0 && (
        <OrderTable 
          orders={orders}
          onEdit={() => {}} // (implement if you want editing)
          onDelete={handleDelete}
        />
      )}
    </div>
  );
} 