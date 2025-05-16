import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await registerUser({
        username: email,
        password,
        email,
        fullName
      });
      if (response.success) {
        navigate('/login');
      } else {
        setMessage(response.message || 'Registration failed.');
      }
    } catch (error) {
      setMessage(error.message || 'An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: 400,
      margin: '3rem auto',
      padding: '2rem',
      background: '#fff',
      borderRadius: 12,
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Create an account</h2>
        <div style={{ color: '#6c757d', fontSize: 16 }}>
          Enter your details to create an account and start ordering
        </div>
      </div>
      <form onSubmit={handleRegister}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 500 }}>Full Name</label>
          <input
            type="text"
            placeholder="Your full name"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: 6,
              border: '1px solid #ddd',
              marginTop: 4
            }}
            required
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 500 }}>Email</label>
          <input
            type="email"
            placeholder="your.email@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: 6,
              border: '1px solid #ddd',
              marginTop: 4
            }}
            required
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 500 }}>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: 6,
              border: '1px solid #ddd',
              marginTop: 4
            }}
            required
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 500 }}>Confirm Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: 6,
              border: '1px solid #ddd',
              marginTop: 4
            }}
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            background: '#5ba89c',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '12px 0',
            fontWeight: 600,
            fontSize: 16,
            marginBottom: 16,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
      {message && (
        <div style={{
          marginTop: '10px',
          padding: '10px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          {message}
        </div>
      )}
      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <span style={{ color: '#6c757d' }}>Already have an account? </span>
        <a href="/login" style={{ color: '#4ca1af', fontWeight: 500 }}>Login</a>
      </div>
    </div>
  );
} 