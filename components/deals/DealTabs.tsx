'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapPin, FileText } from 'lucide-react'
import type { Deal } from '@prisma/client'
import type { DealInputs, DealMetrics } from '@/lib/finance/types'
import { DealForm } from './DealForm'
import { MetricsCards } from './MetricsCards'
import { RecommendationBadge } from './RecommendationBadge'
import { ProFormaTable } from '../tables/ProFormaTable'
import { SensitivityTables } from '../tables/SensitivityTables'
import { computeSensitivity } from '@/lib/finance'
import { formatCurrency } from '@/lib/formatters'

interface Props {
  deal: Deal
  inputs: DealInputs
  metrics: DealMetrics
}

const TABS = ['Overview', 'Pro Forma', 'Sensitivity', 'Edit'] as const
type Tab = typeof TABS[number]

export function DealTabs({ deal, inputs, metrics }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('Overview')
  const sensitivity = computeSensitivity(inputs)

  return (
    <div className="fade-in">
      {/* Deal Header */}
      <div className="deal-header">
        <div>
          <p className="page-eyebrow" style={{ marginBottom: 6 }}>Deal Analysis</p>
          <h1 className="page-title">{deal.name}</h1>
          <div className="deal-header-meta">
            <span className="deal-header-pill">
              <MapPin size={12} />
              {deal.neighborhood}
            </span>
            <span className="deal-header-sep">·</span>
            <span className="deal-header-pill">{deal.units} units</span>
            <span className="deal-header-sep">·</span>
            <span className="deal-header-pill">{formatCurrency(deal.purchasePrice)}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <RecommendationBadge recommendation={metrics.recommendation} score={metrics.dealScore} />
          <Link href={`/multifamily/${deal.id}/report`} className="btn btn-primary" style={{ height: 34, fontSize: 13 }}>
            <FileText size={14} />
            Investor Report
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-nav">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'Overview' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <MetricsCards metrics={metrics} />
          <div className="data-table-wrapper">
            <div className="data-table-header">
              <p className="card-title">NOI &amp; Cash Flow by Year</p>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ fontSize: 13 }}>
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>Gross Rent</th>
                    <th>NOI</th>
                    <th>Cash Flow</th>
                    <th>Cum. Cash Flow</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.proForma.map(row => (
                    <tr key={row.year}>
                      <td className="num">{row.year}</td>
                      <td className="num">{formatCurrency(row.grossPotentialIncome)}</td>
                      <td className="num table-cell-primary">{formatCurrency(row.noi)}</td>
                      <td className="num">{formatCurrency(row.cashFlow)}</td>
                      <td className="num">{formatCurrency(row.cumulativeCashFlow)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Pro Forma' && (
        <div className="data-table-wrapper fade-in">
          <div className="data-table-header">
            <div>
              <p className="card-title">Pro Forma Projections</p>
              <p className="card-subtitle">{deal.holdPeriodYears}-year hold period</p>
            </div>
          </div>
          <ProFormaTable
            proForma={metrics.proForma}
            exitValuation={metrics.exitValuation}
            holdPeriodYears={deal.holdPeriodYears}
          />
        </div>
      )}

      {activeTab === 'Sensitivity' && (
        <div className="fade-in">
          <SensitivityTables
            sensitivity={sensitivity}
            baseRentGrowth={inputs.annualRentGrowth}
            baseExitCap={inputs.exitCapRate}
          />
        </div>
      )}

      {activeTab === 'Edit' && (
        <div className="fade-in">
          <DealForm
            dealId={deal.id}
            defaultValues={{
              name: deal.name,
              neighborhood: deal.neighborhood,
              address: deal.address ?? '',
              units: deal.units,
              purchasePrice: deal.purchasePrice,
              monthlyGrossRent: deal.monthlyGrossRent,
              vacancyRate: deal.vacancyRate,
              operatingExpenseRatio: deal.operatingExpenseRatio,
              annualRentGrowth: deal.annualRentGrowth,
              annualExpenseGrowth: deal.annualExpenseGrowth,
              holdPeriodYears: deal.holdPeriodYears,
              exitCapRate: deal.exitCapRate,
              acquisitionClosingCosts: deal.acquisitionClosingCosts,
              renovationCapex: deal.renovationCapex,
              equityInvested: deal.equityInvested,
              preferredReturnRate: deal.preferredReturnRate,
              sponsorPromoteRate: deal.sponsorPromoteRate,
            }}
          />
        </div>
      )}
    </div>
  )
}
