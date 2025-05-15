import { useState, useEffect } from 'react';
import { fetchOrders, addOrder, deleteOrder, updateOrder, fetchAvailability } from '../api';
import OrderForm from '../components/OrderForm';
import OrderTable from '../components/OrderTable';
import './OrdersPage.css';

const BASE_PRICES = {
  R: 9,
  M: 11,
  L: 14
};

const AVAILABLE_BASES = ['rice', 'black rice', 'salad'];
const AVAILABLE_PROTEINS = ['salmon', 'tuna', 'chicken', 'tofu'];
const AVAILABLE_INGREDIENTS = [
  'cucumber', 'avocado', 'carrot', 'onion',
  'edamame', 'corn', 'ginger', 'wasabi'
];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingOrder, setEditingOrder] = useState(null);
  const [availability, setAvailability] = useState({});
  const [bowls, setBowls] = useState([{
    size: 'R',
    base: 'rice',
    proteins: [],
    ingredients: [],
    quantity: 1
  }]);
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch orders and availability on component mount
  useEffect(() => {
    loadOrders();
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      const data = await fetchAvailability();
      setAvailability(data);
    } catch (err) {
      console.error('Error loading availability:', err);
    }
  };

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

  const calculateBowlPrice = (bowl) => {
    let price = BASE_PRICES[bowl.size];
    const maxIngredients = bowl.size === 'L' ? 6 : 4;
    
    if (bowl.ingredients.length > maxIngredients) {
      price *= 1.2; // 20% extra for extra ingredients
    }
    
    return price;
  };

  const calculateTotalPrice = () => {
    const subtotal = bowls.reduce((total, bowl) => {
      return total + (calculateBowlPrice(bowl) * bowl.quantity);
    }, 0);

    // Apply 10% discount for orders with more than 4 bowls
    const totalBowls = bowls.reduce((total, bowl) => total + bowl.quantity, 0);
    return totalBowls > 4 ? subtotal * 0.9 : subtotal;
  };

  const handleAddBowl = () => {
    setBowls([...bowls, {
      size: 'R',
      base: 'rice',
      proteins: [],
      ingredients: [],
      quantity: 1
    }]);
  };

  const handleRemoveBowl = (index) => {
    setBowls(bowls.filter((_, i) => i !== index));
  };

  const handleBowlChange = (index, field, value) => {
    const newBowls = [...bowls];
    newBowls[index] = { ...newBowls[index], [field]: value };
    setBowls(newBowls);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Get the current user from localStorage
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (!currentUser || !currentUser.id) {
        throw new Error('Please log in to place an order');
      }

      // First create each bowl and get their IDs
      const bowlPromises = bowls.map(async (bowl) => {
        const bowlData = {
          size: bowl.size,
          base: bowl.base,
          proteins: Array.isArray(bowl.proteins) ? bowl.proteins.join(',') : bowl.proteins,
          ingredients: Array.isArray(bowl.ingredients) ? bowl.ingredients.join(',') : bowl.ingredients,
          quantity: parseInt(bowl.quantity) || 1
        };

        console.log('Creating bowl with data:', bowlData);

        const response = await fetch('/api/bowls', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bowlData)
        });

        // Log the raw response for debugging
        const responseText = await response.text();
        console.log('Raw bowl creation response:', responseText);
        
        let result;
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Failed to parse bowl response:', parseError);
          throw new Error(`Invalid response from server: ${responseText}`);
        }

        console.log('Parsed bowl creation response:', result);

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Failed to create bowl');
        }

        if (!result.bowl || !result.bowl.id) {
          throw new Error('Invalid bowl response: missing bowl ID');
        }

        return result.bowl.id;
      });

      // Wait for all bowls to be created
      const bowlIds = await Promise.all(bowlPromises);
      console.log('Created bowl IDs:', bowlIds);

      // Create the order with bowl IDs
      const order = {
        bowls: bowlIds,
        totalPrice: calculateTotalPrice(),
        specialRequests,
        status: 'pending',
        createdAt: new Date().toISOString(),
        userId: currentUser.id  // Use the actual user ID
      };

      console.log('Submitting order:', order);

      // Submit the order
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order)
      });

      // Log the raw response for debugging
      const orderResponseText = await orderResponse.text();
      console.log('Raw order submission response:', orderResponseText);
      
      let orderResult;
      try {
        orderResult = JSON.parse(orderResponseText);
      } catch (parseError) {
        console.error('Failed to parse order response:', parseError);
        throw new Error(`Invalid response from server: ${orderResponseText}`);
      }

      console.log('Parsed order submission response:', orderResult);

      if (!orderResponse.ok || !orderResult.success) {
        throw new Error(orderResult.message || 'Failed to submit order');
      }

      // Reset form and show success message
      setBowls([{
        size: 'R',
        base: 'rice',
        proteins: [],
        ingredients: [],
        quantity: 1
      }]);
      setSpecialRequests('');
      setError('');
      
      // Reload the orders list
      await loadOrders();
      
      alert('Order submitted successfully!');
    } catch (err) {
      console.error('Error submitting order:', err);
      setError(err.message || 'Failed to submit order');
    } finally {
      setIsSubmitting(false);
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
      
      {/* New Order Form */}
      <form onSubmit={handleSubmitOrder} className="order-form">
        <h3>Create New Order</h3>
        
        {bowls.map((bowl, index) => (
          <div key={index} className="bowl-config">
            <h4>Bowl {index + 1}</h4>
            
            <div className="form-group">
              <label>Size</label>
              <select
                value={bowl.size}
                onChange={(e) => handleBowlChange(index, 'size', e.target.value)}
              >
                <option value="R">Regular (€{BASE_PRICES.R})</option>
                <option value="M">Medium (€{BASE_PRICES.M})</option>
                <option value="L">Large (€{BASE_PRICES.L})</option>
              </select>
            </div>

            <div className="form-group">
              <label>Base</label>
              <select
                value={bowl.base}
                onChange={(e) => handleBowlChange(index, 'base', e.target.value)}
              >
                {AVAILABLE_BASES.map(base => (
                  <option key={base} value={base}>{base}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Proteins (Select {bowl.size === 'R' ? '1' : bowl.size === 'M' ? '2' : '3'})</label>
              <div className="checkbox-group">
                {AVAILABLE_PROTEINS.map(protein => (
                  <label key={protein}>
                    <input
                      type="checkbox"
                      checked={bowl.proteins.includes(protein)}
                      onChange={(e) => {
                        const newProteins = e.target.checked
                          ? [...bowl.proteins, protein]
                          : bowl.proteins.filter(p => p !== protein);
                        handleBowlChange(index, 'proteins', newProteins);
                      }}
                    />
                    {protein}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Ingredients (Select 1-{bowl.size === 'L' ? '6' : '4'})</label>
              <div className="checkbox-group">
                {AVAILABLE_INGREDIENTS.map(ingredient => (
                  <label key={ingredient}>
                    <input
                      type="checkbox"
                      checked={bowl.ingredients.includes(ingredient)}
                      onChange={(e) => {
                        const newIngredients = e.target.checked
                          ? [...bowl.ingredients, ingredient]
                          : bowl.ingredients.filter(i => i !== ingredient);
                        handleBowlChange(index, 'ingredients', newIngredients);
                      }}
                    />
                    {ingredient}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                min="1"
                value={bowl.quantity}
                onChange={(e) => handleBowlChange(index, 'quantity', parseInt(e.target.value))}
              />
            </div>

            <button
              type="button"
              className="remove-bowl"
              onClick={() => handleRemoveBowl(index)}
            >
              Remove Bowl
            </button>
          </div>
        ))}

        <button type="button" onClick={handleAddBowl}>Add Another Bowl</button>

        <div className="form-group">
          <label>Special Requests</label>
          <textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="Any special requests or allergy notes..."
          />
        </div>

        <div className="order-summary">
          <h4>Order Summary</h4>
          {bowls.map((bowl, index) => (
            <div key={index} className="bowl-summary">
              <p>Bowl {index + 1}: {bowl.size} - €{(calculateBowlPrice(bowl) * bowl.quantity).toFixed(2)}</p>
            </div>
          ))}
          
          <div className="total-summary">
            <p>Total Bowls: {bowls.reduce((total, bowl) => total + bowl.quantity, 0)}</p>
            <p>Total Price: €{calculateTotalPrice().toFixed(2)}</p>
            {bowls.reduce((total, bowl) => total + bowl.quantity, 0) > 4 && (
              <p className="discount">10% discount applied!</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="submit-order"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Order'}
        </button>
      </form>
      
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