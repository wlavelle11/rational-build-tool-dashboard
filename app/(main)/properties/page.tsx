import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { analyzeDeal } from '@/lib/finance'
import { calculateFlip } from '@/lib/finance/flip'
import { formatCurrency, formatPercent } from '@/lib/formatters'
import { Building2, Home, MapPin } from 'lucide-react'
import { StatCard } from '@/components/ui/stat-card'

export const dynamic = 'force-dynamic'

function StrategyBadge({ strategy }: { strategy: 'multifamily' | 'residential' }) {
  if (strategy === 'multifamily') {
    return (
      <span className="badge badge-brand" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <Building2 size={11} />
        Multifamily
      </span>
    )
  }
  return (
    <span className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'color-mix(in srgb, var(--color-success) 12%, transparent)', color: 'var(--color-success)' }}>
      <Home size={11} />
      Flip / BRRR
    </span>
  )
}

function RecBadge({ rec }: { rec: string }) {
  const cfg: Record<string, string> = {
    'Strong Buy': 'badge badge-success',
    'Caution':    'badge badge-warning',
    'Pass':       'badge badge-danger',
  }
  return (
    <span className={cfg[rec] ?? 'badge badge-neutral'}>
      <span className="badge-dot" />
      {rec}
    </span>
  )
}

export default async function PropertiesPage() {
  const [deals, residentialProjects] = await Promise.all([
    prisma.deal.findMany({ orderBy: { updatedAt: 'desc' } }),
    prisma.residentialProject.findMany({ orderBy: { updatedAt: 'desc' } }),
  ])

  const multifamilyRows = deals.map((deal) => {
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
    return {
      strategy: 'multifamily' as const,
      id: deal.id,
      name: deal.name,
      neighborhood: deal.neighborhood,
      address: deal.address,
      purchasePrice: deal.purchasePrice,
      keyMetric: `IRR ${formatPercent(metrics.irr)}`,
      recommendation: metrics.recommendation,
      updatedAt: deal.updatedAt,
      href: `/multifamily/${deal.id}`,
    }
  })

  const residentialRows = residentialProjects.map((p) => {
    const flip = calculateFlip({
      purchasePrice: p.purchasePrice,
      renovationBudget: p.renovationBudget,
      arv: p.arv,
      holdPeriodMonths: p.flipHoldMonths,
      buyClosingCosts: p.buyClosingCosts,
      sellClosingCostsPct: p.flipSellClosingPct,
      investorCapital: p.flipInvestorCapital,
      monthlyCarryingCosts: p.flipMonthlyCarrying,
      financingType: p.flipFinancingType as 'cash' | 'hard_money',
      hardMoneyLtvPct: p.flipHardMoneyLtvPct ?? undefined,
      hardMoneyRate: p.flipHardMoneyRate ?? undefined,
      hardMoneyPoints: p.flipHardMoneyPoints ?? undefined,
    })
    return {
      strategy: 'residential' as const,
      id: p.id,
      name: p.name,
      neighborhood: p.neighborhood,
      address: p.address,
      purchasePrice: p.purchasePrice,
      keyMetric: `ARV ${formatCurrency(p.arv)}`,
      recommendation: flip.recommendation,
      updatedAt: p.updatedAt,
      href: `/residential`,
    }
  })

  const allProperties = [...multifamilyRows, ...residentialRows]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  const totalValue = allProperties.reduce((s, p) => s + p.purchasePrice, 0)

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <p className="page-eyebrow">Portfolio</p>
          <h1 className="page-title">All Properties</h1>
          <p className="page-description">Every property analyzed across all investment strategies</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard
          label="Total Properties"
          value={String(allProperties.length)}
          sub="Across all strategies"
          icon={<MapPin size={16} />}
        />
        <StatCard
          label="Multifamily"
          value={String(deals.length)}
          sub="Deals analyzed"
          icon={<Building2 size={16} />}
        />
        <StatCard
          label="Residential"
          value={String(residentialProjects.length)}
          sub="Flip / BRRR analyzed"
          icon={<Home size={16} />}
        />
        <StatCard
          label="Total Value"
          value={totalValue >= 1_000_000 ? `$${(totalValue / 1_000_000).toFixed(1)}M` : formatCurrency(totalValue)}
          sub="Combined acquisition cost"
        />
      </div>

      {allProperties.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><MapPin size={24} /></div>
            <p className="empty-state-title">No properties yet</p>
            <p className="empty-state-desc">
              Properties will appear here once you save a multifamily deal or residential analysis.
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'center' }}>
              <Link href="/multifamily/new" className="btn btn-primary">
                <Building2 size={14} />
                New Multifamily Deal
              </Link>
              <Link href="/residential/new" className="btn btn-outline">
                <Home size={14} />
                New Residential Analysis
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <div className="data-table-header">
            <div>
              <p className="card-title">Property Directory</p>
              <p className="card-subtitle">{allProperties.length} propert{allProperties.length !== 1 ? 'ies' : 'y'} saved</p>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Strategy</th>
                  <th>Purchase Price</th>
                  <th>Key Metric</th>
                  <th style={{ textAlign: 'center' }}>Rating</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {allProperties.map((p) => (
                  <tr key={`${p.strategy}-${p.id}`}>
                    <td>
                      <Link href={p.href} className="deal-row-link">
                        <div className="deal-row-name truncate-line">{p.name}</div>
                        <div className="table-cell-muted" style={{ marginTop: 2 }}>
                          {p.address ?? p.neighborhood}
                        </div>
                      </Link>
                    </td>
                    <td>
                      <StrategyBadge strategy={p.strategy} />
                    </td>
                    <td className="num">{formatCurrency(p.purchasePrice)}</td>
                    <td className="num table-cell-primary">{p.keyMetric}</td>
                    <td style={{ textAlign: 'center' }}>
                      <RecBadge rec={p.recommendation} />
                    </td>
                    <td className="num table-cell-muted">
                      {new Date(p.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
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
