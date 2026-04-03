'use client'

import Link from 'next/link'
import { ArrowLeft, Printer } from 'lucide-react'

export function PrintButton({ backHref }: { backHref: string }) {
  return (
    <div className="report-print-bar no-print">
      <Link href={backHref} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280', textDecoration: 'none' }}>
        <ArrowLeft size={14} /> Back to Analysis
      </Link>
      <button
        onClick={() => window.print()}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: '#18181b', color: 'white', border: 'none',
          borderRadius: 8, padding: '10px 20px', fontSize: 14,
          fontWeight: 600, cursor: 'pointer', letterSpacing: '0.01em',
        }}
      >
        <Printer size={15} />
        Print / Save PDF
      </button>
    </div>
  )
}
