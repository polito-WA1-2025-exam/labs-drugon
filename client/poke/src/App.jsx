import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { Container, Navbar, Nav } from 'react-bootstrap'
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
        <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
          <Container>
            <Navbar.Brand as={Link} to="/">Poke Shop</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link as={Link} to="/">Home</Nav.Link>
                <Nav.Link as={Link} to="/orders">Orders</Nav.Link>
              </Nav>
              <Nav>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
        
        <Container>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/orders" element={<OrdersPage />} />
          </Routes>
        </Container>
      </div>
    </Router>
  )
}

export default App
