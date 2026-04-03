import Link from 'next/link'
import { NavLinks } from '@/components/layout/nav-links'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <header className="nav">
        <div className="nav-inner">
          <Link href="/" className="nav-brand">
            <div className="nav-logo-mark" style={{ letterSpacing: '0.04em', fontWeight: 800 }}>RBD</div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              <span className="nav-brand-name" style={{ fontWeight: 700, fontSize: 14 }}>Rational Build</span>
              <span style={{ fontSize: 10, color: 'var(--color-text-tertiary)', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Investment Dashboard</span>
            </div>
          </Link>
          <NavLinks />
        </div>
      </header>
      <div className="page-container">
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  )
}
