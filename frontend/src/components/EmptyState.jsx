import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'No records found', subtitle = 'Try adjusting your search or filters.' }) {
  return (
    <div className="empty-state">
      <Inbox size={32} />
      <h3>{title}</h3>
      <p>{subtitle}</p>
    </div>
  );
}
