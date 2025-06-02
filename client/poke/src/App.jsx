import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { Container, Navbar, Nav } from 'react-bootstrap'
import { FiShoppingCart } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
// import LoginPage from './pages/LoginPage'
// import OrdersPage from './pages/OrdersPage'

import HomePage   from './pages/HomePage'
import LoginPage  from './pages/LoginPage'
import OrdersPage from './pages/OrdersPage'
import CartPage from './pages/CartPage'
import RegisterPage from './pages/RegisterPage'
import ProtectedRoute from './components/ProtectedRoute'

import './App.css'

function App() {
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
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="app-container">
        <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
          <Container>
            <Navbar.Brand as={Link} to="/">Poke Shop</Navbar.Brand>
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link as={Link} to="/">Home</Nav.Link>
                {user && <Nav.Link as={Link} to="/orders">New Order</Nav.Link>}
              </Nav>
              <Nav className="align-items-center" style={{ gap: '1rem' }}>
                {user ? (
                  <>
                    <Nav.Link as={Link} to="/cart" style={{ padding: '0 0.5rem', display: 'flex', alignItems: 'center' }} title="View Cart">
                      <span style={{ fontSize: '1.5rem', color: '#fff', cursor: 'pointer' }}>
                        <FiShoppingCart />
                      </span>
                    </Nav.Link>
                    <button
                      onClick={handleLogout}
                      style={{
                        border: '1px solid #fff',
                        borderRadius: '6px',
                        fontWeight: 600,
                        padding: '4px 18px',
                        background: 'transparent',
                        color: '#fff',
                        cursor: 'pointer'
                      }}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Nav.Link as={Link} to="/login" style={{
                    border: '1px solid #222',
                    borderRadius: '6px',
                    fontWeight: 600,
                    padding: '4px 18px',
                    background: '#fff',
                    color: '#222',
                    display: 'inline-block'
                  }}>
                    Login <span style={{ fontWeight: 400 }}>/</span> Register
                  </Nav.Link>
                )}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
        
        <Container>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route 
              path="/orders" 
              element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              } 
            />
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </Container>
      </div>
    </Router>
  )
}

export default App
