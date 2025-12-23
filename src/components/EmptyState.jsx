import { memo } from 'react';

export const EmptyState = memo(function EmptyState({ title = 'No data', message = 'There is nothing to display', icon = '📭' }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
});

