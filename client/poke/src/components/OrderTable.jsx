import React from 'react';
import StatusBadge from './StatusBadge';

function formatBowl(bowl) {
  if (!bowl || typeof bowl !== 'object') return '';
  const sizeMap = { R: 'Regular', M: 'Medium', L: 'Large' };
  const size = sizeMap[bowl.size] || bowl.size;
  const base = bowl.base || '';
  const proteins = bowl.proteins && bowl.proteins.length ? bowl.proteins.join(', ') : '';
  const ingredients = bowl.ingredients && bowl.ingredients.length ? bowl.ingredients.join(', ') : '';
  const qty = bowl.quantity ? `${bowl.quantity}x ` : '';
  let summary = `${qty}${size} (${base})`;
  if (proteins) summary += ` - ${proteins}`;
  if (ingredients) summary += ` | ${ingredients}`;
  return summary;
}

function renderBowls(bowls) {
  // If bowls is a string, try to parse it
  let parsed = bowls;
  if (typeof bowls === 'string') {
    try {
      parsed = JSON.parse(bowls);
    } catch {
      // fallback: show as is
      return bowls;
    }
  }
  if (!Array.isArray(parsed)) return '' + parsed;
  return parsed.map((b, i) => <div key={i}>{formatBowl(b)}</div>);
}

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
              <td>{renderBowls(order.bowls)}</td>
              <td>${order.totalPrice.toFixed(2)}</td>
              <td>
                <StatusBadge status={order.status} />
              </td>
              <td>{new Date(order.createdAt).toLocaleString()}</td>
              <td className="actions">
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