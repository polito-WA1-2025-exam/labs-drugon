import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getAvailability } from '../api';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import pokeBowlImg from '../assets/poke-bowl.jpg'; // Use a local image or placeholder

export default function HomePage() {
  const [shops, setShops] = useState([]);
  const [availability, setAvailability] = useState({});
  const [error, setError] = useState('');
  const location = useLocation();

  const fetchAvailability = async () => {
    try {
      const data = await getAvailability();
      setAvailability(data);
      setError('');
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [location.pathname]); // Refresh when route changes

  const specs = {
    R: { label: 'Regular Bowls', left: availability.R ?? 0, total: 10 },
    M: { label: 'Medium Bowls', left: availability.M ?? 0, total: 8 },
    L: { label: 'Large Bowls', left: availability.L ?? 0, total: 6 },
  };

  return (
    <div style={{ background: 'linear-gradient(90deg, #4ca1af 0%, #c4e0e5 100%)', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Container fluid className="py-5" style={{ background: 'transparent' }}>
        <Row className="align-items-center">
          <Col md={6} className="text-white">
            <h1 style={{ fontWeight: 700, fontSize: '2.8rem' }}>Build Your Perfect Poke Bowl</h1>
            <p className="lead mb-4">Fresh ingredients, customizable options, and delicious flavors delivered straight to you.</p>
            <Button as={Link} to="/orders" variant="warning" size="lg">Start Building</Button>
          </Col>
          <Col md={6} className="d-flex justify-content-center">
            <Card style={{ width: 340, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
              <Card.Img variant="top" src={pokeBowlImg} alt="Poke Bowl" />
              <Badge bg="warning" text="dark" style={{ position: 'absolute', bottom: 16, right: 16 }}>Fresh & Healthy</Badge>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Availability Section */}
      <Container className="py-5 bg-white text-center">
        <h2 className="mb-4" style={{ fontWeight: 700 }}>Today's Availability</h2>
        {error && <p className="text-danger">{error}</p>}
        <Row className="justify-content-center">
          {Object.entries(specs).map(([size, { label, left, total }]) => (
            <Col key={size} xs={12} md={4} className="mb-4">
              <Card className="border-0 shadow-sm p-3 align-items-center" style={{ borderRadius: '50%', width: 160, height: 160, margin: '0 auto', background: '#f6faf9' }}>
                <Card.Body className="d-flex flex-column justify-content-center align-items-center h-100">
                  <h3 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#4ca1af' }}>{left}</h3>
                  <div style={{ fontWeight: 600 }}>{label}</div>
                  <div style={{ fontSize: '0.95rem', color: '#888' }}>{left} out of {total} available</div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* How It Works Section */}
      <Container className="py-5" style={{ background: '#f7f9fa' }}>
        <h2 className="text-center mb-5" style={{ fontWeight: 700 }}>How It Works</h2>
        <Row className="text-center mb-4">
          <Col md={4} className="mb-4">
            <div style={{ fontSize: '2.5rem' }}>🥣</div>
            <h5 className="mt-3">1. Choose Your Bowl</h5>
            <p>Select from Regular, Medium, or Large sizes with different protein options</p>
          </Col>
          <Col md={4} className="mb-4">
            <div style={{ fontSize: '2.5rem' }}>🥑</div>
            <h5 className="mt-3">2. Customize</h5>
            <p>Pick your base, proteins, and add your favorite fresh ingredients</p>
          </Col>
          <Col md={4} className="mb-4">
            <div style={{ fontSize: '2.5rem' }}>😊</div>
            <h5 className="mt-3">3. Enjoy</h5>
            <p>Submit your order, and enjoy your custom poke creation</p>
          </Col>
        </Row>
        <div className="text-center">
          <Button as={Link} to="/orders" variant="success" size="lg">Start Building Your Bowl</Button>
        </div>
      </Container>
    </div>
  );
}
