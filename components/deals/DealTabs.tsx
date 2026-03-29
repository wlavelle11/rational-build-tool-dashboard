'use client'

import { useState } from 'react'
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{deal.name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {deal.neighborhood} · {deal.units} units · {formatCurrency(deal.purchasePrice)}
          </p>
        </div>
        <RecommendationBadge recommendation={metrics.recommendation} score={metrics.dealScore} />
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'Overview' && (
        <div className="space-y-8">
          <MetricsCards metrics={metrics} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">NOI Growth</h3>
              <NOIChart proForma={metrics.proForma} />
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Annual Cash Flow</h3>
              <CashFlowChart proForma={metrics.proForma} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Pro Forma' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <ProFormaTable proForma={metrics.proForma} exitValuation={metrics.exitValuation} holdPeriodYears={deal.holdPeriodYears} />
        </div>
      )}

      {activeTab === 'Sensitivity' && (
        <SensitivityTables sensitivity={sensitivity} baseRentGrowth={inputs.annualRentGrowth} baseExitCap={inputs.exitCapRate} />
      )}

      {activeTab === 'Edit' && (
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
      )}
    </div>
  )
}
