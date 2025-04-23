// src/components/NavBar.jsx
import { Link } from 'react-router-dom';

export default function NavBar() {
  return (
    <nav style={{ padding: '0.5rem 1rem', background: '#eee', display: 'flex', gap: '1rem' }}>
      <Link to="/">Home</Link>
      <Link to="/login">Log In</Link>
      <Link to="/order">Order</Link>
      <Link to="/orders">My Orders</Link>
    </nav>
  );
}
