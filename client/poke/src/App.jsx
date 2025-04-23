import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
// import LoginPage from './pages/LoginPage'
// import OrdersPage from './pages/OrdersPage'

import HomePage   from './pages/HomePage'
import LoginPage  from './pages/LoginPage'
import OrdersPage from './pages/OrdersPage'

import './App.css'

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav className="main-nav">
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/orders">Orders</Link></li>
          </ul>
        </nav>
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/orders" element={<OrdersPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
