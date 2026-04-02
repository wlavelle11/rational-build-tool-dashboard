'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Building2, MapPin, Home, Plus, ChevronDown, Hammer, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useRef, useEffect } from 'react'

export function NavLinks() {
  const pathname = usePathname()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className="nav-links">
      <Link
        href="/"
        className={cn('nav-link', isActive('/') && 'active')}
      >
        <BarChart3 size={14} />
        Dashboard
      </Link>
      <Link
        href="/multifamily"
        className={cn('nav-link', isActive('/multifamily') && 'active')}
      >
        <Building2 size={14} />
        Multifamily
      </Link>
      <Link
        href="/residential"
        className={cn('nav-link', isActive('/residential') && 'active')}
      >
        <Home size={14} />
        Residential
      </Link>
      <Link
        href="/adu"
        className={cn('nav-link', isActive('/adu') && 'active')}
      >
        <Hammer size={14} />
        ADU
      </Link>
      <Link
        href="/leads"
        className={cn('nav-link', isActive('/leads') && 'active')}
      >
        <Target size={14} />
        Leads
      </Link>
      <Link
        href="/properties"
        className={cn('nav-link', isActive('/properties') && 'active')}
      >
        <MapPin size={14} />
        Properties
      </Link>
      <div className="nav-divider" />
      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="btn btn-brand"
          style={{ height: 32, fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <Plus size={14} />
          New Analysis
          <ChevronDown size={12} />
        </button>
        {dropdownOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 6,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            minWidth: 220,
            zIndex: 100,
            overflow: 'hidden',
          }}>
            <Link
              href="/multifamily/new"
              onClick={() => setDropdownOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', fontSize: 13, color: 'var(--color-text-primary)',
                textDecoration: 'none', borderBottom: '1px solid var(--color-border)',
              }}
              className="dropdown-item"
            >
              <Building2 size={15} color="var(--color-text-secondary)" />
              <div>
                <div style={{ fontWeight: 600 }}>Multifamily Deal</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>Apartment underwriting</div>
              </div>
            </Link>
            <Link
              href="/residential/new"
              onClick={() => setDropdownOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', fontSize: 13, color: 'var(--color-text-primary)',
                textDecoration: 'none', borderBottom: '1px solid var(--color-border)',
              }}
              className="dropdown-item"
            >
              <Home size={15} color="var(--color-text-secondary)" />
              <div>
                <div style={{ fontWeight: 600 }}>Residential Flip / BRRR</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>Compare exit strategies</div>
              </div>
            </Link>
            <Link
              href="/adu/new"
              onClick={() => setDropdownOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', fontSize: 13, color: 'var(--color-text-primary)',
                textDecoration: 'none',
              }}
              className="dropdown-item"
            >
              <Hammer size={15} color="var(--color-text-secondary)" />
              <div>
                <div style={{ fontWeight: 600 }}>ADU Development</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>Feasibility + 10-year model</div>
              </div>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
