import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Investor Report — Rational Build Design',
}

export default function ReportLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        body {
          background: white !important;
          color: #111827 !important;
        }
      `}</style>
      {children}
    </>
  )
}
