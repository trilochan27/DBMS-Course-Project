import React from 'react';

const TONES = {
  Paid: 'green',
  Picked: 'green',
  'Picked Up': 'green',
  Active: 'green',
  Pending: 'amber',
  Delayed: 'amber',
  Late: 'amber',
  Absent: 'red',
  Inactive: 'red',
};

export default function Badge({ label }) {
  const tone = TONES[label] || 'slate';
  return <span className={`badge badge-${tone}`}>{label}</span>;
}
