'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Property } from '@prisma/client'
import { formatCurrency, formatPercent } from '@/lib/formatters'
import { Building2, ArrowUpRight } from 'lucide-react'

const NEIGHBORHOODS = ['All', 'Clairemont', 'North Park', 'University Heights', 'Normal Heights', 'City Heights', 'Hillcrest']

export function PropertyGrid({ properties }: { properties: Property[] }) {
  const router = useRouter()
  const [neighborhood, setNeighborhood] = useState('All')
  const [maxPrice, setMaxPrice] = useState('')
  const [minUnits, setMinUnits] = useState('')

  const filtered = properties.filter(p => {
    if (neighborhood !== 'All' && p.neighborhood !== neighborhood) return false
    if (maxPrice && p.askingPrice > parseFloat(maxPrice)) return false
    if (minUnits && p.units < parseInt(minUnits)) return false
    return true
  })

  const loadProperty = (p: Property) => {
    const params = new URLSearchParams({
      name: p.name, neighborhood: p.neighborhood, address: p.address ?? '',
      units: String(p.units), purchasePrice: String(p.askingPrice),
      monthlyGrossRent: String(p.monthlyGrossRent), vacancyRate: String(p.vacancyRate),
      operatingExpenseRatio: String(p.operatingExpenseRatio), annualRentGrowth: String(p.annualRentGrowth),
      annualExpenseGrowth: String(p.annualExpenseGrowth), exitCapRate: String(p.exitCapRate),
      equityInvested: String(Math.round(p.askingPrice * 1.03)),
      acquisitionClosingCosts: String(Math.round(p.askingPrice * 0.02)),
    })
    router.push(`/deals/new?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Neighborhood</label>
            <select value={neighborhood} onChange={e => setNeighborhood(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              {NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Max Price ($)</label>
            <input type="number" placeholder="2000000" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-36" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Min Units</label>
            <input type="number" placeholder="4" value={minUnits} onChange={e => setMinUnits(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-24" />
          </div>
          <p className="text-sm text-gray-500 self-end pb-2">Showing {filtered.length} of {properties.length}</p>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Building2 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No properties match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <div key={p.id} className="bg-white rounded-lg border border-gray-200 p-5 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{p.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{p.neighborhood}</p>
                </div>
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium">{p.units} units</span>
              </div>
              {p.address && <p className="text-xs text-gray-400 mb-3">{p.address}</p>}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div><p className="text-xs text-gray-500">Asking Price</p><p className="text-sm font-semibold text-gray-900">{formatCurrency(p.askingPrice)}</p></div>
                <div><p className="text-xs text-gray-500">Monthly Rent</p><p className="text-sm font-semibold text-gray-900">{formatCurrency(p.monthlyGrossRent)}</p></div>
                <div><p className="text-xs text-gray-500">Vacancy</p><p className="text-sm text-gray-700">{formatPercent(p.vacancyRate)}</p></div>
                <div><p className="text-xs text-gray-500">Exit Cap</p><p className="text-sm text-gray-700">{formatPercent(p.exitCapRate)}</p></div>
              </div>
              {p.notes && <p className="text-xs text-gray-500 italic mb-4 flex-1">{p.notes}</p>}
              <button onClick={() => loadProperty(p)} className="mt-auto flex items-center justify-center gap-2 w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
                Analyze Deal <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
