// components/ParsedResults.tsx
import React from 'react';
import { TracerRecord } from '../types/tracer';

interface ParsedResultsProps {
  rows: TracerRecord[];
}

const ParsedResults: React.FC<ParsedResultsProps> = ({ rows }) => {
  if (rows.length === 0) {
    return (
      <p className="text-gray-500 italic">
        No data parsed.
      </p>
    );
  }

  const columns = Object.keys(rows[0]) as (keyof TracerRecord)[];

  return (
    <div className="overflow-x-auto max-h-96 border border-gray-200 rounded-md">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            {columns.map(col => (
              <th
                key={col}
                className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                {col.replace(/_/g, ' ')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row, i) => (
            <tr
              key={i}
              className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
            >
              {columns.map(col => {
                const val = row[col];
                const display = 
                  typeof val === 'boolean'
                    ? (val ? '✓' : '')
                    : String(val);
                return (
                  <td
                    key={col}
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                  >
                    {display}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ParsedResults;
