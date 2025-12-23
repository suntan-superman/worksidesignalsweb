import { memo } from 'react';

export const SeverityBadge = memo(function SeverityBadge({ severity }) {
  const severityStyles = {
    critical: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-blue-100 text-blue-800',
  };

  const style = severityStyles[severity?.toLowerCase()] || severityStyles.low;

  return (
    <span className={`badge-severity ${style}`}>
      {severity}
    </span>
  );
});

