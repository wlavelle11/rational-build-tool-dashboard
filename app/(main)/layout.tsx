import Link from 'next/link'
import { NavLinks } from '@/components/layout/nav-links'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <header className="nav">
        <div className="nav-inner">
          <Link href="/" className="nav-brand">
            <div className="nav-logo-mark">RBD</div>
            <span className="nav-brand-name">Deal Analyzer</span>
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
