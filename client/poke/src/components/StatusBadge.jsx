import React from 'react';

export default function StatusBadge({ status }) {
  return (
    <span className={`status-badge ${status}`}>
      {status}
    </span>
  );
} 