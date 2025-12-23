import { memo } from 'react';

export const Card = memo(function Card({ children, className = '' }) {
  return (
    <div className={`card p-6 ${className}`}>
      {children}
    </div>
  );
});

