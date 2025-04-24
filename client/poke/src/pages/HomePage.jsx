import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchShops, fetchAvailability } from '../api';
import NavBar from '../components/NavBar';
import AvailabilityCard from '../components/AvailabilityCard';
import ShopCard from '../components/ShopCard';

export default function HomePage() {
  const [shops, setShops] = useState([]);
  const [availability, setAvailability] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAvailability().then(setAvailability).catch(e => setError(e.message));
    fetchShops().then(setShops).catch(e => setError(e.message));
  }, []);

  const specs = {
    R: { label: 'Regular', price: 9, proteins: 1, ingredients: 4 },
    M: { label: 'Medium',  price:11, proteins: 2, ingredients: 4 },
    L: { label: 'Large',   price:14, proteins: 3, ingredients: 6 },
  };

  return (
    <>
      <main className="home">
        <h1>Welcome to PokeShop</h1>
        {error && <p className="error">{error}</p>}

        <section>
          <h2>Today's Availability</h2>
          <div className="grid availability-grid">
            {Object.entries(specs).map(([size, {label,price,proteins,ingredients}]) => (
              <AvailabilityCard
                key={size}
                label={label}
                price={price}
                left={availability[size] ?? 0}
                proteins={proteins}
                ingredients={ingredients}
              />
            ))}
          </div>
        </section>

        <section>
          <h2>Our Shops</h2>
          <div className="grid shops-grid">
            {shops.map(shop => <ShopCard key={shop.id} shop={shop} />)}
          </div>
        </section>

        <section className="cta">
          <Link to="/order"><button>Start Your Order</button></Link>
        </section>
      </main>
    </>
  );
}
