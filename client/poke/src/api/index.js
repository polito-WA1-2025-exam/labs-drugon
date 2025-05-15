const BASE_URL = '/api'; // Vite proxy will map this to your backend

export async function loginUser(username, password) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  
  const data = await res.json();
  
  if (data.success) {
    // Store user data in localStorage
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  
  return data;
}

// Order-related API functions
export async function fetchOrders() {
  const res = await fetch(`${BASE_URL}/orders`);
  return res.json();
}

export async function addOrder(orderData) {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  return res.json();
}

export async function updateOrder(orderId, orderData) {
  const res = await fetch(`${BASE_URL}/orders/${orderId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  return res.json();
}

export async function deleteOrder(orderId) {
  const res = await fetch(`${BASE_URL}/orders/${orderId}`, {
    method: 'DELETE',
  });
  return res.json();
}

export async function fetchShops() {
  const res = await fetch(`${BASE_URL}/shops`);
  if (!res.ok) throw new Error('Failed to fetch shops');
  return res.json();
}

export async function fetchAvailability() {
  const res = await fetch(`${BASE_URL}/availability`);
  if (!res.ok) throw new Error('Failed to fetch availability');
  return res.json();
}

// Add more functions: registerUser, fetchBowls, addOrder, etc.
