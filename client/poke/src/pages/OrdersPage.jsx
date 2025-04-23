import { useState, useEffect } from 'react';
import { fetchOrders, addOrder, deleteOrder, updateOrder } from '../api';
import OrderForm from '../components/OrderForm';
import OrderTable from '../components/OrderTable';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingOrder, setEditingOrder] = useState(null);

  // Fetch orders on component mount
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await fetchOrders();
      setOrders(data);
      setError('');
    } catch (err) {
      setError('Failed to load orders. Please try again.');
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrder = async (orderData) => {
    try {
      const response = await addOrder(orderData);
      if (response.success) {
        setOrders([...orders, response.order]);
        setError('');
      } else {
        setError(response.message || 'Failed to add order');
      }
    } catch (err) {
      setError('An error occurred while adding the order');
      console.error('Error adding order:', err);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) {
      return;
    }
    
    try {
      const response = await deleteOrder(orderId);
      if (response.success) {
        setOrders(orders.filter(order => order.id !== orderId));
        setError('');
      } else {
        setError(response.message || 'Failed to delete order');
      }
    } catch (err) {
      setError('An error occurred while deleting the order');
      console.error('Error deleting order:', err);
    }
  };

  const handleUpdateOrder = async (orderData) => {
    try {
      const response = await updateOrder(editingOrder.id, orderData);
      if (response.success) {
        setOrders(orders.map(order => 
          order.id === editingOrder.id ? { ...orderData, id: order.id } : order
        ));
        setEditingOrder(null);
        setError('');
      } else {
        setError(response.message || 'Failed to update order');
      }
    } catch (err) {
      setError('An error occurred while updating the order');
      console.error('Error updating order:', err);
    }
  };

  const startEditing = (order) => {
    setEditingOrder(order);
  };

  const cancelEditing = () => {
    setEditingOrder(null);
  };

  if (loading) {
    return <div className="orders-container">Loading orders...</div>;
  }

  return (
    <div className="orders-container">
      <h2>Orders Management</h2>
      
      {error && <p className="error">{error}</p>}
      
      {/* Add New Order Form */}
      {!editingOrder && (
        <OrderForm 
          onSubmit={handleAddOrder}
        />
      )}
      
      {/* Edit Order Form */}
      {editingOrder && (
        <OrderForm 
          order={editingOrder}
          onSubmit={handleUpdateOrder}
          onCancel={cancelEditing}
          isEditing={true}
        />
      )}
      
      {/* Orders Table */}
      <OrderTable 
        orders={orders}
        onEdit={startEditing}
        onDelete={handleDeleteOrder}
      />
    </div>
  );
} 