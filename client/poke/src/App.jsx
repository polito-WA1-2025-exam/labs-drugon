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
        <header className="app-header">
          <div className="header-left">
            <Link to="/" className="logo">Poke Shop</Link>
            <nav className="main-nav">
              <Link to="/">Home</Link>
              <Link to="/orders">Orders</Link>
            </nav>
          </div>
          <div className="header-right">
            <Link to="/login" className="login-link">Login</Link>
          </div>
        </header>
        
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
