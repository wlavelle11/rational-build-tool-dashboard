'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, Download, Loader2 } from 'lucide-react'

interface PrintButtonProps {
  backHref: string
  type: 'residential' | 'adu' | 'multifamily'
  id: string
}

export function PrintButton({ backHref, type, id }: PrintButtonProps) {
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/report/${type}/${id}`)
      if (!res.ok) throw new Error('PDF generation failed')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const disposition = res.headers.get('Content-Disposition') ?? ''
      const match = disposition.match(/filename="([^"]+)"/)
      a.download = match ? match[1] : 'Investor-Report.pdf'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {/* Back link — top left */}
      <Link
        href={backHref}
        style={{
          position: 'fixed', top: 24, left: 32, zIndex: 100,
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 13, color: '#6b7280', textDecoration: 'none',
          background: 'white', padding: '8px 14px', borderRadius: 8,
          border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}
        className="no-print"
      >
        <ArrowLeft size={14} /> Back
      </Link>

      {/* Save button — top right */}
      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          position: 'fixed', top: 24, right: 32, zIndex: 100,
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: saving ? '#374151' : '#18181b', color: 'white',
          border: 'none', borderRadius: 8, padding: '10px 20px',
          fontSize: 14, fontWeight: 600, cursor: saving ? 'default' : 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
          opacity: saving ? 0.8 : 1,
          transition: 'background 0.15s',
        }}
        className="no-print"
      >
        {saving
          ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />Generating…</>
          : <><Download size={15} />Save Report</>
        }
      </button>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}
