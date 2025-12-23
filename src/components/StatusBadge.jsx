import { memo } from 'react';

export const StatusBadge = memo(function StatusBadge({ status, variant = 'default' }) {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    default: 'bg-blue-100 text-blue-800',
  };

  const color = statusColors[variant] || statusColors.default;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color}`}>
      {status}
    </span>
  );
});

