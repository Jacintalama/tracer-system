'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTracer } from '@/app/hooks/useTracers';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { DocumentTextIcon } from '@heroicons/react/24/solid';

export default function PreviewLetterPage() {
  const { id } = useParams();
  const tracerId = Number(id);
  const { record, isLoading, error } = useTracer(tracerId);
  const [downloading, setDownloading] = useState(false);

  if (isLoading) return <p>Loading preview…</p>;
  if (error || !record) return <p>Error loading record.</p>;

  const issuedCount = [record.first, record.second, record.third].filter(Boolean).length;
  const indexLabels  = ['First', 'Second', 'Third'];
  const tracerIndex  = issuedCount < 3 ? indexLabels[issuedCount] : 'Final';
  const headerLabel  = issuedCount < 3
    ? `${indexLabels[issuedCount]} Tracer Notice`
    : 'Final Tracer Notice';

  const formattedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const letterStyle: React.CSSProperties = {
    maxWidth:       '800px',
    margin:         '0 auto',
    padding:        '32px',
    backgroundColor:'#fff',
    color:          '#000',
    fontFamily:     'Arial, sans-serif',
    lineHeight:     1.5,
  };
  const headerStyle: React.CSSProperties = {
    textAlign:        'center',
    textDecoration:   'underline',
    marginBottom:     '16px',
    fontSize:         '24px',
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const element = document.getElementById('letter');
      if (!element) throw new Error('Letter element not found');

      // @ts-ignore
      const canvas = await html2canvas(element, { scale: 2 } as any);
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
      const pdfWidth  = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`tracer_${tracerId}_${tracerIndex}.pdf`);
    } catch (err: any) {
      console.error('Download error:', err);
      alert(`Error generating PDF: ${err.message}`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      {/* hide any .no-print elements if someone actually prints the page */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div id="letter" style={letterStyle}>
        <h1 style={headerStyle}>{headerLabel}</h1>
        <p>Date: {formattedDate}</p>

        <div style={{ marginTop: '16px' }}>
          <p><strong>To:</strong></p>
          <p>{record.owner}</p>
          <p>Business: {record.business}</p>
          <p>Address: {record.address}</p>
        </div>

        <div style={{ marginTop: '24px' }}>
          <p>Dear {record.owner},</p>
          <p>
            Our records indicate you have received your <em>{tracerIndex.toLowerCase()}</em> tracer notice but have not yet settled your account. Please present yourself at our office within seven (7) days of this notice to clear your outstanding balance and avoid further action.
          </p>
          <p>Thank you for your prompt attention to this matter.</p>
        </div>
      </div>

      {/* Button is now outside of the #letter wrapper */}
      <button
        className="no-print"
        onClick={handleDownload}
        disabled={downloading}
        style={{
          marginTop:     '32px',
          display:       'flex',
          alignItems:    'center',
          justifyContent:'center',
          padding:       '12px 24px',
          backgroundColor:'#2563EB',
          color:         '#fff',
          border:        'none',
          borderRadius:  '8px',
          cursor:        'pointer',
          opacity:       downloading ? 0.6 : 1,
        }}
      >
        <DocumentTextIcon style={{ width: '20px', height: '20px', marginRight: '8px' }} />
        {downloading ? 'Generating PDF…' : 'Download PDF'}
      </button>
    </>
  );
}
