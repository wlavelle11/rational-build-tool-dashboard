import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
import { analyzeDeal } from '@/lib/finance'
import { formatCurrency, formatPercent, formatMultiple } from '@/lib/formatters'
import { Plus, TrendingUp, Building2 } from 'lucide-react'

function RecommendationBadge({ rec }: { rec: string }) {
  const styles: Record<string, string> = {
    'Strong Buy': 'bg-emerald-100 text-emerald-800',
    'Caution': 'bg-amber-100 text-amber-800',
    'Pass': 'bg-red-100 text-red-800',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[rec] ?? 'bg-gray-100 text-gray-800'}`}>
      {rec}
    </span>
  )
}

export default async function DashboardPage() {
  const deals = await prisma.deal.findMany({ orderBy: { updatedAt: 'desc' } })

  const dealsWithMetrics = deals.map((deal) => {
    const metrics = analyzeDeal({
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
    })
    return { deal, metrics }
  })

  const avgIRR = dealsWithMetrics.length > 0
    ? dealsWithMetrics.reduce((s, d) => s + d.metrics.irr, 0) / dealsWithMetrics.length
    : 0

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deal Pipeline</h1>
          <p className="text-sm text-gray-500 mt-1">Multifamily acquisition analysis</p>
        </div>
        <Link href="/deals/new" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4" />
          New Deal
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-md"><Building2 className="h-5 w-5 text-blue-600" /></div>
            <div>
              <p className="text-sm text-gray-500">Total Deals</p>
              <p className="text-2xl font-bold text-gray-900">{deals.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-md"><TrendingUp className="h-5 w-5 text-emerald-600" /></div>
            <div>
              <p className="text-sm text-gray-500">Avg IRR</p>
              <p className="text-2xl font-bold text-gray-900">{formatPercent(avgIRR)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-md"><TrendingUp className="h-5 w-5 text-purple-600" /></div>
            <div>
              <p className="text-sm text-gray-500">Strong Buys</p>
              <p className="text-2xl font-bold text-gray-900">{dealsWithMetrics.filter(d => d.metrics.recommendation === 'Strong Buy').length}</p>
            </div>
          </div>
        </div>
      </div>

      {deals.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No deals yet</h3>
          <p className="text-gray-500 mb-6">Start by creating your first deal analysis.</p>
          <Link href="/deals/new" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
            <Plus className="h-4 w-4" />Create Deal
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Deal</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Units</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Price</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Cap Rate</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">IRR</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">EM</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Rating</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dealsWithMetrics.map(({ deal, metrics }) => (
                <tr key={deal.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/deals/${deal.id}`} className="hover:text-blue-600 transition-colors">
                      <div className="font-medium text-gray-900">{deal.name}</div>
                      <div className="text-xs text-gray-500">{deal.neighborhood}</div>
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-right text-gray-700">{deal.units}</td>
                  <td className="px-4 py-4 text-right text-gray-700">{formatCurrency(deal.purchasePrice)}</td>
                  <td className="px-4 py-4 text-right text-gray-700">{formatPercent(metrics.year1CapRate)}</td>
                  <td className="px-4 py-4 text-right font-medium text-gray-900">{formatPercent(metrics.irr)}</td>
                  <td className="px-4 py-4 text-right text-gray-700">{formatMultiple(metrics.equityMultiple)}</td>
                  <td className="px-4 py-4 text-center"><RecommendationBadge rec={metrics.recommendation} /></td>
                  <td className="px-4 py-4 text-right text-gray-500 text-xs">{new Date(deal.updatedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
