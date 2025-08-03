'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { TracerRecord } from '../types/tracer';
import {
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/solid';

interface Props {
  rows: TracerRecord[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onPreview: (id: number) => void;
  onGenerate: (id: number) => void;
  selectedIds: number[];
  onSelectOne: (id: number) => void;
  onSelectAll: () => void;
}

type PortalInfo = {
  id: number;
  x: number;
  y: number;
};

export default function TracerTable({
  rows,
  onEdit,
  onDelete,
  onPreview,
  onGenerate,
  selectedIds,
  onSelectOne,
  onSelectAll,
}: Props) {
  const [portalInfo, setPortalInfo] = useState<PortalInfo | null>(null);

  useEffect(() => {
    const onClickOutside = () => setPortalInfo(null);
    window.addEventListener('click', onClickOutside);
    return () => window.removeEventListener('click', onClickOutside);
  }, []);

  const handleToggleMenu = (
    id: number,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const y = rect.bottom + window.scrollY;
    const x = rect.left + window.scrollX;
    setPortalInfo((prev) => (prev?.id === id ? null : { id, x, y }));
  };

  const handleAction = (action: (id: number) => void, id: number) => {
    action(id);
    setPortalInfo(null);
  };

  const columns: { key: keyof TracerRecord; label: string; width: string }[] = [
    { key: 'no', label: 'No.', width: 'w-12' },
    { key: 'establishment', label: 'Establishment', width: 'w-40' },
    { key: 'owner', label: 'Owner', width: 'w-32' },
    { key: 'address', label: 'Address', width: 'w-48' },
    { key: 'business', label: 'Business', width: 'w-32' },
    { key: 'date', label: 'Date', width: 'w-24' },
    { key: 'first', label: '1st', width: 'w-16' },
    { key: 'date2', label: 'Date2', width: 'w-24' },
    { key: 'second', label: '2nd', width: 'w-16' },
    { key: 'date3', label: 'Date3', width: 'w-24' },
    { key: 'third', label: '3rd', width: 'w-16' },
    { key: 'datefinal', label: 'Date Final', width: 'w-24' },
    { key: 'final', label: 'Final', width: 'w-16' },
    { key: 'remarks', label: 'Remarks', width: 'w-40' },
  ];

  return (
    <div className="overflow-x-auto relative">
      <table className="min-w-full table-fixed">
        <thead className="sticky top-0 bg-gray-50">
          <tr>
            <th className="w-10 px-2">
              <input
                type="checkbox"
                checked={rows.length > 0 && selectedIds.length === rows.length}
                onChange={onSelectAll}
              />
            </th>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${col.width}`}
              >
                {col.label}
              </th>
            ))}
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider w-32">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-gray-50">
              <td className="px-2">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(r.id)}
                  onChange={() => onSelectOne(r.id)}
                />
              </td>
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 py-2 whitespace-nowrap text-sm text-gray-700 ${col.width}`}
                >
                  {r[col.key] ?? ''}
                </td>
              ))}
              <td className="px-4 py-2 whitespace-nowrap text-sm w-32">
                <button
                  onClick={(e) => handleToggleMenu(r.id, e)}
                  className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                >
                  Actions
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {portalInfo &&
        createPortal(
          <div
            style={{
              position: 'absolute',
              top: portalInfo.y,
              left: portalInfo.x,
            }}
            className="bg-white border rounded shadow-lg z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => handleAction(onPreview, portalInfo.id)}
              className="flex items-center px-4 py-2 text-left hover:bg-gray-100 w-full"
            >
              <DocumentTextIcon className="w-4 h-4 text-indigo-600 mr-2" />
              Preview
            </button>
            <button
              onClick={() => handleAction(onEdit, portalInfo.id)}
              className="flex items-center px-4 py-2 text-left hover:bg-gray-100 w-full"
            >
              <PencilIcon className="w-4 h-4 text-green-600 mr-2" />
              Edit
            </button>
            <button
              onClick={() => handleAction(onDelete, portalInfo.id)}
              className="flex items-center px-4 py-2 text-left hover:bg-gray-100 w-full"
            >
              <TrashIcon className="w-4 h-4 text-red-600 mr-2" />
              Delete
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}
