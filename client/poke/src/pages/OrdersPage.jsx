import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, createOrder, getAvailability } from '../api';

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

const mainBg = {
  minHeight: '100vh',
  background: '#f7f8fa',
  padding: '2rem 0',
};
const card = {
  background: '#fff',
  borderRadius: 16,
  boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
  padding: '2rem',
  marginBottom: '2rem',
  maxWidth: 700,
  marginLeft: 'auto',
  marginRight: 'auto',
};
const sectionTitle = {
  fontSize: '2rem',
  fontWeight: 700,
  textAlign: 'center',
  marginBottom: '2rem',
  color: '#222',
};
const bowlCard = {
  background: '#f9fafb',
  borderRadius: 12,
  boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
  padding: '1.5rem',
  marginBottom: '2rem',
};
const label = {
  fontWeight: 600,
  marginBottom: 6,
  display: 'block',
  color: '#333',
};
const input = {
  width: '100%',
  padding: '0.5rem',
  border: '1px solid #ddd',
  borderRadius: 6,
  fontSize: '1rem',
  marginBottom: '1rem',
};
const checkboxGroup = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1.2rem',
  marginBottom: '1rem',
};
const checkboxLabel = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontSize: '1rem',
  minWidth: 120,
};
const removeBtn = {
  background: '#f44336',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  padding: '0.5rem 1.2rem',
  fontWeight: 600,
  cursor: 'pointer',
  marginTop: 8,
};
const addBtn = {
  background: '#3bb77e',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  padding: '0.7rem 1.5rem',
  fontWeight: 700,
  fontSize: '1.1rem',
  cursor: 'pointer',
  margin: '1rem 0',
  display: 'block',
  marginLeft: 'auto',
  marginRight: 'auto',
};
const submitBtn = {
  width: '100%',
  background: '#3bb77e',
  color: '#fff',
  padding: '0.9rem',
  border: 'none',
  borderRadius: 8,
  fontWeight: 'bold',
  fontSize: '1.2rem',
  cursor: 'pointer',
  marginTop: '1.5rem',
  opacity: 1,
  transition: 'opacity 0.2s',
};
const disabledBtn = {
  ...submitBtn,
  opacity: 0.7,
  cursor: 'not-allowed',
};
const errorBox = {
  background: '#ffeaea',
  color: '#d32f2f',
  borderRadius: 6,
  padding: '0.8rem 1rem',
  marginBottom: '1.5rem',
  textAlign: 'center',
  fontWeight: 500,
};
const summaryBox = {
  background: '#f1f8e9',
  borderRadius: 10,
  padding: '1.2rem',
  marginTop: '2rem',
  marginBottom: '2rem',
  textAlign: 'center',
  color: '#2e7d32',
  fontWeight: 600,
  fontSize: '1.1rem',
};

export default function OrdersPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [bowls, setBowls] = useState([{
    size: 'R',
    base: 'rice',
    proteins: [],
    ingredients: [],
    quantity: 1
  }]);
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/sessions/current', {
          credentials: 'include'
        });
        if (!response.ok) {
          navigate('/login');
          return;
        }
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
        } else {
          navigate('/login');
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    const fetchAvailability = async () => {
      try {
        const data = await getAvailability();
        setAvailability(data);
      } catch (err) {
        setError('Failed to fetch availability data');
        console.error('Error fetching availability:', err);
      }
    };
    checkAuth();
    fetchAvailability();
  }, [navigate]);

  if (loading) {
    return <div style={{textAlign:'center',marginTop:'4rem',fontSize:'1.5rem'}}>Loading...</div>;
  }
  if (!user) {
    return null; // Will redirect to login
  }

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
    setSuccess(false);
    try {
      const orderData = {
        bowls: bowls.map(bowl => ({
          size: bowl.size,
          base: bowl.base,
          proteins: bowl.proteins,
          ingredients: bowl.ingredients,
          quantity: parseInt(bowl.quantity)
        })),
        totalPrice: calculateTotalPrice(),
        specialRequests: specialRequests || '',
        status: 'pending'
      };

      console.log('Submitting order data:', orderData); // Debug log

      const result = await createOrder(orderData);
      if (result.success) {
        // Refresh availability data
        const newAvailability = await getAvailability();
        setAvailability(newAvailability);
        
        setBowls([{ size: 'R', base: 'rice', proteins: [], ingredients: [], quantity: 1 }]);
        setSpecialRequests('');
        setError('');
        setSuccess(true);
        setTimeout(() => { setSuccess(false); navigate('/cart'); }, 1200);
      } else {
        setError(result.message || 'Failed to submit order');
      }
    } catch (err) {
      console.error('Error submitting order:', err);
      setError(err.message || 'Failed to submit order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={mainBg}>
      <div style={card}>
        <div style={sectionTitle}>Create New Order</div>
        {error && <div style={errorBox}>{error}</div>}
        {success && <div style={{...errorBox, background:'#e8f5e9', color:'#388e3c'}}>Order submitted successfully!</div>}
        <form onSubmit={handleSubmitOrder}>
          {bowls.map((bowl, index) => (
            <div key={index} style={bowlCard}>
              <div style={{fontWeight:700, fontSize:'1.2rem', marginBottom:16}}>Bowl {index + 1}</div>
              <div style={{marginBottom:16}}>
                <label style={label}>Size</label>
                <select
                  style={input}
                  value={bowl.size}
                  onChange={(e) => handleBowlChange(index, 'size', e.target.value)}
                >
                  <option value="R">Regular (€{BASE_PRICES.R})</option>
                  <option value="M">Medium (€{BASE_PRICES.M})</option>
                  <option value="L">Large (€{BASE_PRICES.L})</option>
                </select>
              </div>
              <div style={{marginBottom:16}}>
                <label style={label}>Base</label>
                <select
                  style={input}
                  value={bowl.base}
                  onChange={(e) => handleBowlChange(index, 'base', e.target.value)}
                >
                  {AVAILABLE_BASES.map(base => (
                    <option key={base} value={base}>{base}</option>
                  ))}
                </select>
              </div>
              <div style={{marginBottom:16}}>
                <label style={label}>Proteins</label>
                <div style={{fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem'}}>
                  {bowl.size === 'R' ? 'Select exactly 1 protein' : 
                   bowl.size === 'M' ? 'Select up to 2 proteins' : 
                   'Select up to 3 proteins'}
                </div>
                <div style={checkboxGroup}>
                  {AVAILABLE_PROTEINS.map(protein => (
                    <label key={protein} style={checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={bowl.proteins.includes(protein)}
                        onChange={(e) => {
                          const newProteins = e.target.checked
                            ? [...bowl.proteins, protein]
                            : bowl.proteins.filter(p => p !== protein);
                          
                          // Enforce protein limits
                          if (bowl.size === 'R' && newProteins.length > 1) {
                            return; // Don't allow more than 1 protein for Regular
                          } else if (bowl.size === 'M' && newProteins.length > 2) {
                            return; // Don't allow more than 2 proteins for Medium
                          } else if (bowl.size === 'L' && newProteins.length > 3) {
                            return; // Don't allow more than 3 proteins for Large
                          }
                          
                          handleBowlChange(index, 'proteins', newProteins);
                        }}
                        style={{width:18, height:18, accentColor:'#3bb77e'}}
                      />
                      {protein}
                    </label>
                  ))}
                </div>
              </div>
              <div style={{marginBottom:16}}>
                <label style={label}>Ingredients</label>
                <div style={{fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem'}}>
                  {bowl.size === 'L' ? 'Select up to 6 ingredients' : 'Select up to 4 ingredients'}
                </div>
                <div style={checkboxGroup}>
                  {AVAILABLE_INGREDIENTS.map(ingredient => (
                    <label key={ingredient} style={checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={bowl.ingredients.includes(ingredient)}
                        onChange={(e) => {
                          const newIngredients = e.target.checked
                            ? [...bowl.ingredients, ingredient]
                            : bowl.ingredients.filter(i => i !== ingredient);
                          
                          // Enforce ingredient limits
                          const maxIngredients = bowl.size === 'L' ? 6 : 4;
                          if (newIngredients.length > maxIngredients) {
                            return; // Don't allow more than the maximum ingredients
                          }
                          
                          handleBowlChange(index, 'ingredients', newIngredients);
                        }}
                        style={{width:18, height:18, accentColor:'#3bb77e'}}
                      />
                      {ingredient}
                    </label>
                  ))}
                </div>
              </div>
              <div style={{marginBottom:16}}>
                <label style={label}>Quantity</label>
                <input
                  type="number"
                  min="1"
                  style={input}
                  value={bowl.quantity}
                  onChange={(e) => handleBowlChange(index, 'quantity', parseInt(e.target.value))}
                />
              </div>
              {bowls.length > 1 && (
                <button
                  type="button"
                  style={removeBtn}
                  onClick={() => handleRemoveBowl(index)}
                >
                  Remove Bowl
                </button>
              )}
            </div>
          ))}
          <button type="button" style={addBtn} onClick={handleAddBowl}>+ Add Another Bowl</button>
          <div style={summaryBox}>
            <div>Total Price: <span style={{fontWeight:700, fontSize:'1.2rem'}}>€{calculateTotalPrice().toFixed(2)}</span></div>
            {bowls.reduce((total, bowl) => total + bowl.quantity, 0) > 4 && (
              <div style={{color:'#388e3c', marginTop:4}}>10% discount applied!</div>
            )}
          </div>
          <div style={{marginBottom:24}}>
            <label style={label}>Special Requests</label>
            <textarea
              style={{...input, minHeight:80, resize:'vertical'}}
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Any special requests or allergy notes..."
            />
          </div>
          <button
            type="submit"
            style={isSubmitting ? disabledBtn : submitBtn}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Order'}
          </button>
        </form>
      </div>
    </div>
  );
} 