import Link from 'next/link'
import { Building2, BarChart3, MapPin } from 'lucide-react'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            <span className="font-semibold text-gray-900 text-lg">RBD Deal Analyzer</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors">
              <BarChart3 className="h-4 w-4" />
              Deals
            </Link>
            <Link href="/properties" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors">
              <MapPin className="h-4 w-4" />
              Properties
            </Link>
            <Link href="/deals/new" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
              New Deal
            </Link>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
