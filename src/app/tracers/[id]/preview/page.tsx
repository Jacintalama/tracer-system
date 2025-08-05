'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { DocumentTextIcon } from '@heroicons/react/24/solid';
import { useParams } from 'next/navigation';
import { useTracer } from '@/app/hooks/useTracers';

export default function BatchLetterPage() {
  const { id } = useParams();
  const tracerId = Number(id);
  const { record, isLoading, error } = useTracer(tracerId);
  const [loading, setLoading] = useState(false);

  if (isLoading) return <p>Loading…</p>;
  if (error || !record) return <p>Error loading record.</p>;

  // Duplicate the single record into two pages
  const records = [record, record];

  const handleDownload = async () => {
    setLoading(true);
    try {
      const sheet = document.getElementById('sheet')!;
      const canvas = await html2canvas(sheet, { scale: 2 } as any);
      const imgData = canvas.toDataURL('image/png');

      // switch format to 'legal'
      const pdf = new jsPDF({
        unit:        'mm',
        format:      'legal',
        orientation: 'portrait',
      });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (canvas.height * pdfW) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH);
      pdf.save(`batch_tracer_${tracerId}.pdf`);
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center bg-gray-50 p-4">
      {/* Full-size sheet container: 8.5×14" */}
      <div
        id="sheet"
        className="
          w-[215.9mm] h-[355.6mm] bg-white 
          py-[8mm] box-border
        "
      >
        {records.map((r, idx) => {
          const issued = [r.first, r.second, r.third].filter(Boolean).length;
          const labels = ['First', 'Second', 'Third'];
          const phase  = issued < 3 ? labels[issued] : 'Final';
          const title  = `${phase.toUpperCase()} TRACER`;

          return (
            <div
              key={idx}
              className="
                relative w-full h-[calc(50%-4mm)]
                px-[12mm] py-[4mm]
                box-border flex flex-col justify-between
              "
            >
              {/* HEADER */}
              <div className="flex items-center">
                <div className="w-[32mm] h-[16mm] relative">
                  <Image
                    src="/Logo1.png"
                    fill
                    alt="Seal"
                    className="object-contain"
                  />
                </div>
                <div className="flex-1 text-center space-y-[1px] text-[9pt] leading-tight">
                  <div>Republic of the Philippines</div>
                  <div>Province of Sarangani</div>
                  <div>Municipality of Maasim</div>
                  <div className="font-bold underline mt-[2pt]">
                    OFFICE OF THE MUNICIPAL TREASURER
                  </div>
                  <div className="text-[8pt] mt-[1pt]">00000000</div>
                </div>
                <div className="w-[32mm] h-[16mm] relative">
                  <Image
                    src="/maasenso.png"
                    fill
                    alt="Maasenso Logo"
                    className="object-contain"
                  />
                </div>
              </div>

              {/* NOTICE TITLE */}
              <div className="text-center font-bold text-[11pt] my-[2mm]">
                {title}
              </div>

              {/* DETAILS TABLE */}
              <div className="mb-[4mm] text-[10pt]">
                {[
                  ['Date',          '___________'],
                  ['Owner',         r.owner ?? '—'],
                  ['Establishment', r.establishment],
                  ['Business',      r.business],
                  ['Address',       r.address],
                ].map(([label, val]) => (
                  <div key={label} className="flex items-center mb-[0.5mm]">
                    <span className="font-bold mr-[2mm]">{label}</span>
                    <span>{val as string}</span>
                  </div>
                ))}
              </div>

              {/* BODY COPY */}
              <div className="space-y-[1mm] text-[9.5pt] leading-snug">
                <p><strong>Sir / Madam:</strong></p>
                <p>
                  You are cordially invited for a conference on at ____________________________________
                </p>
                <p>
                  to pay your business tax/Mayor’s Permit regarding your business/activity{' '}
                  <strong>{r.business}</strong>. Please prepare your official receipt or previous business permit/license for reference.
                </p>
                <p>Failure to comply shall be under the penalty of law.</p>
                <p>Truly yours,</p>
              </div>

              {/* SIGNATURE BLOCK */}
              <div className="flex justify-between mt-[4mm] px-[12mm] text-[10pt]">
                <div className="flex flex-col items-center">
                  <div>Prepared By:</div>
                  <div className="font-bold underline">JACINT A. ALAMA</div>
                  <div>JO</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="font-bold underline">EDITHA C. MAMINTAS</div>
                  <div>Municipal Treasurer</div>
                </div>
              </div>

              {/* (No bottom cut-off line) */}
            </div>
          );
        })}
      </div>

      {/* Download button */}
      <button
        onClick={handleDownload}
        disabled={loading}
        className="
          mt-[6mm] px-4 py-2 bg-blue-600 text-white rounded 
          flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        <DocumentTextIcon className="w-5 h-5 mr-2" />
        {loading ? 'Generating PDF…' : 'Download Letters'}
      </button>
    </div>
  );
}
