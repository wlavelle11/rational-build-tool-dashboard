'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, MapPin, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export function NavLinks() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav className="nav-links">
      <Link
        href="/"
        className={cn('nav-link', isActive('/') && 'active')}
      >
        <BarChart3 size={14} />
        Deals
      </Link>
      <Link
        href="/properties"
        className={cn('nav-link', isActive('/properties') && 'active')}
      >
        <MapPin size={14} />
        Properties
      </Link>
      <div className="nav-divider" />
      <Link href="/deals/new" className="btn btn-brand" style={{ height: 32, fontSize: 13 }}>
        <Plus size={14} />
        New Deal
      </Link>
    </nav>
  )
}
