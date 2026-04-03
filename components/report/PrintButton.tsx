'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, Download, Loader2 } from 'lucide-react'

export function PrintButton({ backHref }: { backHref: string }) {
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const { default: html2canvas } = await import('html2canvas')
      const { default: jsPDF } = await import('jspdf')

      const el = document.getElementById('report-content')
      if (!el) return

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pageWidth
      const imgHeight = (canvas.height * pageWidth) / canvas.width
      let yOffset = 0
      let remainingHeight = imgHeight

      // Paginate if content is taller than one page
      while (remainingHeight > 0) {
        pdf.addImage(imgData, 'PNG', 0, -yOffset, imgWidth, imgHeight)
        remainingHeight -= pageHeight
        if (remainingHeight > 0) {
          pdf.addPage()
          yOffset += pageHeight
        }
      }

      // Derive filename from the h1 on the page
      const title = el.querySelector('h1')?.textContent ?? 'Investor-Report'
      pdf.save(`${title.replace(/[^a-z0-9]/gi, '-')}-Investor-Report.pdf`)
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
