// src/components/AvailabilityCard.jsx
import React from 'react';

export default function AvailabilityCard({ label, price, left, proteins, ingredients }) {
  return (
    <div className="card availability-card">
      <h3>{label}</h3>
      <p className="price">€{price}</p>
      <p className="left"><strong>{left}</strong> left today</p>
      <p>Proteins: {proteins}</p>
      <p>Ingredients: up to {ingredients}</p>
    </div>
  );
}
