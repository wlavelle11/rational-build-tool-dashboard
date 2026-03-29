'use client'

import { useState } from 'react'
import { MapPin } from 'lucide-react'
import type { Deal } from '@prisma/client'
import type { DealInputs, DealMetrics } from '@/lib/finance/types'
import { DealForm } from './DealForm'
import { MetricsCards } from './MetricsCards'
import { RecommendationBadge } from './RecommendationBadge'
import { ProFormaTable } from '../tables/ProFormaTable'
import { SensitivityTables } from '../tables/SensitivityTables'
import { NOIChart } from '../charts/NOIChart'
import { CashFlowChart } from '../charts/CashFlowChart'
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
        <RecommendationBadge recommendation={metrics.recommendation} score={metrics.dealScore} />
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="chart-card">
              <p className="chart-label">NOI Growth</p>
              <NOIChart proForma={metrics.proForma} />
            </div>
            <div className="chart-card">
              <p className="chart-label">Annual Cash Flow</p>
              <CashFlowChart proForma={metrics.proForma} />
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
