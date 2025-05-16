import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Navigation() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/sessions/current', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUser(data.user);
          }
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        setUser(null);
        navigate('/login');
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (loading) {
    return null; // Or a loading spinner
  }

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <Link to="/">Poke Bowl</Link>
      </div>
      
      <div className="nav-links">
        {user ? (
          <>
            <Link to="/orders" className="nav-link">New Order</Link>
            <Link to="/cart" className="nav-link">Cart</Link>
            <button onClick={handleLogout} className="nav-link logout-btn">
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="nav-link">Login</Link>
        )}
      </div>
    </nav>
  );
} 