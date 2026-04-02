import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { analyzeDeal } from '@/lib/finance'
import { formatCurrency, formatPercent, formatMultiple } from '@/lib/formatters'
import { Plus, Building2, TrendingUp, Star } from 'lucide-react'
import { StatCard } from '@/components/ui/stat-card'

export const dynamic = 'force-dynamic'

function RecBadge({ rec }: { rec: string }) {
  const cfg: Record<string, { cls: string; dot: string }> = {
    'Strong Buy': { cls: 'badge badge-success', dot: 'badge-dot' },
    'Caution':    { cls: 'badge badge-warning', dot: 'badge-dot' },
    'Pass':       { cls: 'badge badge-danger',  dot: 'badge-dot' },
  }
  const c = cfg[rec] ?? { cls: 'badge badge-neutral', dot: 'badge-dot' }
  return (
    <span className={c.cls}>
      <span className={c.dot} />
      {rec}
    </span>
  )
}

export default async function MultifamilyPage() {
  const deals = await prisma.deal.findMany({ orderBy: { updatedAt: 'desc' } })

  const analyzed = deals.map((deal) => {
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

  const avgIRR = analyzed.length > 0
    ? analyzed.reduce((s, d) => s + d.metrics.irr, 0) / analyzed.length
    : 0
  const strongBuys = analyzed.filter(d => d.metrics.recommendation === 'Strong Buy').length
  const totalValue = analyzed.reduce((s, d) => s + d.deal.purchasePrice, 0)

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <p className="page-eyebrow">Portfolio</p>
          <h1 className="page-title">Multifamily Deal Portfolio</h1>
          <p className="page-description">Track and analyze your multifamily acquisition targets</p>
        </div>
        <Link href="/multifamily/new" className="btn btn-primary">
          <Plus size={15} />
          New Deal
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard
          label="Total Deals"
          value={String(deals.length)}
          sub="In portfolio"
          icon={<Building2 size={16} />}
        />
        <StatCard
          label="Avg IRR"
          value={formatPercent(avgIRR)}
          sub="Portfolio average"
          trend={avgIRR >= 0.15 ? 'positive' : avgIRR >= 0.10 ? 'warning' : 'negative'}
          icon={<TrendingUp size={16} />}
        />
        <StatCard
          label="Strong Buys"
          value={String(strongBuys)}
          sub={`${deals.length > 0 ? Math.round((strongBuys / deals.length) * 100) : 0}% of portfolio`}
          trend={strongBuys > 0 ? 'positive' : 'neutral'}
          icon={<Star size={16} />}
        />
        <StatCard
          label="Portfolio Value"
          value={totalValue >= 1_000_000 ? `$${(totalValue / 1_000_000).toFixed(1)}M` : formatCurrency(totalValue)}
          sub="Total acquisition cost"
        />
      </div>

      {deals.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <Building2 size={24} />
            </div>
            <p className="empty-state-title">No deals yet</p>
            <p className="empty-state-desc">
              Add your first deal to start building your portfolio and analyzing returns.
            </p>
            <Link href="/multifamily/new" className="btn btn-primary" style={{ marginTop: 8 }}>
              <Plus size={15} />
              Create your first deal
            </Link>
          </div>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <div className="data-table-header">
            <div>
              <p className="card-title">Active Deals</p>
              <p className="card-subtitle">{deals.length} deal{deals.length !== 1 ? 's' : ''} in portfolio</p>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Deal</th>
                  <th>Units</th>
                  <th>Price</th>
                  <th>Cap Rate</th>
                  <th>IRR</th>
                  <th>EM</th>
                  <th style={{ textAlign: 'center' }}>Rating</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {analyzed.map(({ deal, metrics }) => (
                  <tr key={deal.id}>
                    <td>
                      <Link href={`/multifamily/${deal.id}`} className="deal-row-link">
                        <div className="deal-row-name truncate-line">{deal.name}</div>
                        <div className="table-cell-muted" style={{ marginTop: 2 }}>
                          {deal.neighborhood}
                        </div>
                      </Link>
                    </td>
                    <td className="num">{deal.units}</td>
                    <td className="num">{formatCurrency(deal.purchasePrice)}</td>
                    <td className="num">{formatPercent(metrics.year1CapRate)}</td>
                    <td className="num table-cell-primary">{formatPercent(metrics.irr)}</td>
                    <td className="num">{formatMultiple(metrics.equityMultiple)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <RecBadge rec={metrics.recommendation} />
                    </td>
                    <td className="num table-cell-muted">
                      {new Date(deal.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
