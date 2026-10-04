import React from 'react';

export default function TableSkeleton({ rows = 6, cols = 6 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c}>
              <span className="skeleton skeleton-cell" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
