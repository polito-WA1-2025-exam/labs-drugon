// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
    const response = await loginUser(username, password);
    if (response.success) {
      setMessage('Login successful!');
        // Redirect to orders page after a short delay
        setTimeout(() => {
          navigate('/orders');
        }, 1000);
    } else {
        setMessage(response.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again later.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <input 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            placeholder="Username"
            disabled={isLoading}
          />
          {errors.username && <p className="error">{errors.username}</p>}
        </div>
        <div>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="Password"
            disabled={isLoading}
          />
          {errors.password && <p className="error">{errors.password}</p>}
        </div>
        <button 
          type="submit" 
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      {message && (
        <p className={message.includes('successful') ? 'success' : 'error'}>
          {message}
        </p>
      )}
    </div>
  );
}
