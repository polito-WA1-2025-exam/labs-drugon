import React from 'react';
import StatusBadge from './StatusBadge';

export default function OrderTable({ orders, onEdit, onDelete }) {
  if (!orders || orders.length === 0) {
    return <p>No orders found</p>;
  }

  return (
    <div className="orders-list">
      <h3>Orders List</h3>
      <table className="orders-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>User ID</th>
            <th>Bowls</th>
            <th>Total Price</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.userId}</td>
              <td>{Array.isArray(order.bowls) ? order.bowls.join(', ') : order.bowls}</td>
              <td>${order.totalPrice.toFixed(2)}</td>
              <td>
                <StatusBadge status={order.status} />
              </td>
              <td>{new Date(order.createdAt).toLocaleString()}</td>
              <td className="actions">
                <button 
                  className="edit-btn"
                  onClick={() => onEdit(order)}
                >
                  Edit
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => onDelete(order.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 