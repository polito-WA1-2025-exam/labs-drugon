import { useState, useEffect } from 'react';

export default function OrderForm({ order, onSubmit, onCancel, isEditing = false }) {
  const [formData, setFormData] = useState({
    userId: 1, // Default user ID for now
    bowls: [],
    totalPrice: 0,
    status: 'pending'
  });

  // Load order data if editing
  useEffect(() => {
    if (order) {
      setFormData({
        userId: order.userId || 1,
        bowls: Array.isArray(order.bowls) ? order.bowls : order.bowls.split(','),
        totalPrice: order.totalPrice || 0,
        status: order.status || 'pending'
      });
    }
  }, [order]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ensure bowls is an array of numbers
    const orderData = {
      ...formData,
      bowls: formData.bowls.map(id => parseInt(id))
    };
    onSubmit(orderData);
  };

  const handleBowlChange = (e) => {
    const value = e.target.value;
    // Split by comma and convert to numbers, filtering out any invalid entries
    const bowlIds = value.split(',')
      .map(id => parseInt(id.trim()))
      .filter(id => !isNaN(id));
    
    setFormData(prev => ({
      ...prev,
      bowls: bowlIds
    }));
  };

  return (
    <div className="order-form-container">
      <h3>{isEditing ? 'Edit Order' : 'Add New Order'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="bowls">Bowls (comma-separated IDs)</label>
          <input
            id="bowls"
            type="text"
            value={formData.bowls.join(',')}
            onChange={handleBowlChange}
            required
            placeholder="1,2,3"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="totalPrice">Total Price</label>
          <input
            id="totalPrice"
            type="number"
            value={formData.totalPrice}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              totalPrice: parseFloat(e.target.value) || 0 
            }))}
            required
            min="0"
            step="0.01"
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="button-group">
          <button type="submit">{isEditing ? 'Update Order' : 'Add Order'}</button>
          {isEditing && (
            <button type="button" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
} 