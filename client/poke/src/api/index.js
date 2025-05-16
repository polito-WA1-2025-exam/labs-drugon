const SERVER_URL = 'http://localhost:3000/api';

// Helper function to handle invalid responses
const handleInvalidResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  return response;
};

// Auth functions
export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${SERVER_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for cookie-based auth
      body: JSON.stringify({ email, password }),
    });

    await handleInvalidResponse(response);
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  } catch (error) {
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${SERVER_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    await handleInvalidResponse(response);
    return response.json();
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const response = await fetch(`${SERVER_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    await handleInvalidResponse(response);
    localStorage.removeItem('user');
    return response.json();
  } catch (error) {
    throw error;
  }
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Protected API functions
export const createOrder = async (orderData) => {
  try {
    console.log('Sending order data:', JSON.stringify(orderData, null, 2));
    
    const response = await fetch(`${SERVER_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
      console.error('Server error response:', errorData);
      throw new Error(errorData.message || 'Failed to create order');
    }

    const data = await response.json();
    console.log('Order created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const getUserOrders = async () => {
  try {
    console.log('Fetching user orders...');
    const response = await fetch(`${SERVER_URL}/orders`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
      console.error('Server error response:', errorData);
      throw new Error(errorData.message || 'Failed to fetch orders');
    }

    const data = await response.json();
    console.log('Received orders:', data);
    return data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const deleteOrder = async (orderId) => {
  try {
    const response = await fetch(`${SERVER_URL}/orders/${orderId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete order');
    }
    
    return data;
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};

// Public API functions
export const getAvailability = async () => {
  try {
    const response = await fetch(`${SERVER_URL}/availability`);
    await handleInvalidResponse(response);
    return response.json();
  } catch (error) {
    throw error;
  }
};