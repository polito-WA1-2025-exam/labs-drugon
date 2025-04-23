import { useState } from 'react';
import { Link } from 'react-router-dom';
import { loginUser } from '../api';

export default function Header() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser(username, password);
      if (response.success) {
        setIsLoggedIn(true);
        setError('');
        // You might want to store the user info in context or local storage
        localStorage.setItem('user', JSON.stringify(response.user));
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
      console.error('Login error:', err);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('user');
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <Link to="/" className="logo">Poke Shop</Link>
        <nav className="main-nav">
          <Link to="/">Home</Link>
          <Link to="/orders">Orders</Link>
        </nav>
      </div>
      
      <div className="header-right">
        {isLoggedIn ? (
          <div className="user-info">
            <span>Welcome, {username}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        ) : (
          <form className="login-form" onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Login</button>
            {error && <span className="error-message">{error}</span>}
          </form>
        )}
      </div>
    </header>
  );
} 