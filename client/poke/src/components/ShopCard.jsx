// src/components/ShopCard.jsx
import React from 'react';

export default function ShopCard({ shop }) {
  return (
    <div className="card shop-card">
      <h4>{shop.name}</h4>
      <p className="address">{shop.address}</p>
      <p className="status">
        Status: <span className={shop.isActive ? 'active' : 'inactive'}>
          {shop.isActive ? 'Active' : 'Closed'}
        </span>
      </p>
      <details>
        <summary>Opening Hours</summary>
        <ul>
          {Object.entries(shop.openingHours).map(([day, hrs]) => (
            <li key={day}>
              <strong>{day.charAt(0).toUpperCase()+day.slice(1)}:</strong> {hrs}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
