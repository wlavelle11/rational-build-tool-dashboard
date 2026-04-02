'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Property } from '@prisma/client'
import { formatCurrency, formatPercent } from '@/lib/formatters'
import { Building2, ArrowUpRight, SlidersHorizontal } from 'lucide-react'
import { Select } from '@/components/ui/input'

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
    router.push(`/multifamily/new?${params.toString()}`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Filter Bar */}
      <div className="filter-bar">
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)', alignSelf: 'center' }}>
            <SlidersHorizontal size={13} />
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Filters</span>
          </div>

          <div className="form-field" style={{ gap: 4 }}>
            <label className="form-label" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>Neighborhood</label>
            <Select value={neighborhood} onChange={e => setNeighborhood(e.target.value)} style={{ width: 'auto' }}>
              {NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}
            </Select>
          </div>

          <div className="form-field" style={{ gap: 4 }}>
            <label className="form-label" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>Max Price ($)</label>
            <input
              className="input"
              type="number"
              placeholder="2,000,000"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              style={{ width: 140 }}
            />
          </div>

          <div className="form-field" style={{ gap: 4 }}>
            <label className="form-label" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>Min Units</label>
            <input
              className="input"
              type="number"
              placeholder="4"
              value={minUnits}
              onChange={e => setMinUnits(e.target.value)}
              style={{ width: 90 }}
            />
          </div>

          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginLeft: 'auto', alignSelf: 'center' }}>
            {filtered.length} of {properties.length}
          </p>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><Building2 size={22} /></div>
            <p className="empty-state-title">No matches</p>
            <p className="empty-state-desc">No properties match your current filters.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map(p => (
            <div key={p.id} className="property-card">
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
                <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text)', letterSpacing: '-0.01em' }} className="truncate-line">
                    {p.name}
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{p.neighborhood}</p>
                </div>
                <span className="badge badge-brand" style={{ flexShrink: 0 }}>{p.units} units</span>
              </div>

              {p.address && (
                <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 4 }} className="truncate-line">{p.address}</p>
              )}

              {/* Stats */}
              <div className="property-stats-grid">
                <div>
                  <p className="property-stat-label">Asking Price</p>
                  <p className="property-stat-value">{formatCurrency(p.askingPrice)}</p>
                </div>
                <div>
                  <p className="property-stat-label">Monthly Rent</p>
                  <p className="property-stat-value">{formatCurrency(p.monthlyGrossRent)}</p>
                </div>
                <div>
                  <p className="property-stat-label">Vacancy</p>
                  <p className="property-stat-value" style={{ fontWeight: 500 }}>{formatPercent(p.vacancyRate)}</p>
                </div>
                <div>
                  <p className="property-stat-label">Exit Cap</p>
                  <p className="property-stat-value" style={{ fontWeight: 500 }}>{formatPercent(p.exitCapRate)}</p>
                </div>
              </div>

              {p.notes && (
                <p style={{ fontSize: 12, color: 'var(--color-text-3)', fontStyle: 'italic', marginBottom: 12, lineHeight: 1.5, flex: 1 }}>
                  {p.notes}
                </p>
              )}

              <button
                onClick={() => loadProperty(p)}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 'auto' }}
              >
                Analyze Deal
                <ArrowUpRight size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
