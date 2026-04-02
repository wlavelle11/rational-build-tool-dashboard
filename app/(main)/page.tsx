import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { analyzeDeal } from '@/lib/finance'
import { calculateFlip } from '@/lib/finance/flip'
import { calculateBRRR } from '@/lib/finance/brrr'
import { formatCurrency, formatPercent } from '@/lib/formatters'
import { Building2, Home, Plus, ArrowRight, TrendingUp, Briefcase, Hammer } from 'lucide-react'
import { StatCard } from '@/components/ui/stat-card'

export const dynamic = 'force-dynamic'

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

function StrategyCard({ title, description, href, icon, count, ctaLabel }: {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  count: number
  ctaLabel: string
}) {
  return (
    <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'var(--color-surface-raised)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--color-brand)',
        }}>
          {icon}
        </div>
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>{title}</p>
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{description}</p>
        </div>
      </div>
      <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)' }}>
        {count} <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-tertiary)' }}>project{count !== 1 ? 's' : ''}</span>
      </p>
      <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
        <Link href={href} className="btn btn-primary" style={{ flex: 1 }}>
          View Portfolio
          <ArrowRight size={14} />
        </Link>
        <Link href={`${href}/new`} className="btn btn-outline" style={{ flexShrink: 0 }}>
          <Plus size={14} />
          {ctaLabel}
        </Link>
      </div>
    </div>
  )
}

export default async function HomePage() {
  const [deals, residentialProjects, aduProjects] = await Promise.all([
    prisma.deal.findMany({ orderBy: { updatedAt: 'desc' } }),
    prisma.residentialProject.findMany({ orderBy: { updatedAt: 'desc' } }),
    prisma.aDUProject.findMany({ orderBy: { updatedAt: 'desc' } }),
  ])

  // Analyze multifamily deals
  const analyzedDeals = deals.map((deal) => {
    const metrics = analyzeDeal({
      purchasePrice: deal.purchasePrice, monthlyGrossRent: deal.monthlyGrossRent,
      vacancyRate: deal.vacancyRate, operatingExpenseRatio: deal.operatingExpenseRatio,
      annualRentGrowth: deal.annualRentGrowth, annualExpenseGrowth: deal.annualExpenseGrowth,
      holdPeriodYears: deal.holdPeriodYears, exitCapRate: deal.exitCapRate,
      acquisitionClosingCosts: deal.acquisitionClosingCosts, renovationCapex: deal.renovationCapex,
      equityInvested: deal.equityInvested, preferredReturnRate: deal.preferredReturnRate,
      sponsorPromoteRate: deal.sponsorPromoteRate,
    })
    return { type: 'multifamily' as const, name: deal.name, neighborhood: deal.neighborhood, price: deal.purchasePrice, recommendation: metrics.recommendation, updatedAt: deal.updatedAt, href: `/multifamily/${deal.id}` }
  })

  // Analyze residential projects
  const analyzedResidential = residentialProjects.map((p) => {
    const flip = calculateFlip({
      purchasePrice: p.purchasePrice, renovationBudget: p.renovationBudget, arv: p.arv,
      holdPeriodMonths: p.flipHoldMonths, buyClosingCosts: p.buyClosingCosts,
      sellClosingCostsPct: p.flipSellClosingPct, investorCapital: p.flipInvestorCapital,
      monthlyCarryingCosts: p.flipMonthlyCarrying,
      financingType: p.flipFinancingType as 'cash' | 'hard_money',
      hardMoneyLtvPct: p.flipHardMoneyLtvPct ?? undefined,
      hardMoneyRate: p.flipHardMoneyRate ?? undefined,
      hardMoneyPoints: p.flipHardMoneyPoints ?? undefined,
    })
    return { type: 'residential' as const, name: p.name, neighborhood: p.neighborhood, price: p.purchasePrice, recommendation: flip.recommendation, updatedAt: p.updatedAt, href: '/residential' }
  })

  const analyzedADU = aduProjects.map((p) => ({
    type: 'adu' as const, name: p.name, neighborhood: p.neighborhood, price: p.purchasePrice + p.constructionCost,
    recommendation: (p.cachedRecommendation ?? 'Pass') as string, updatedAt: p.updatedAt, href: '/adu',
  }))

  // Combined recent activity
  const recentActivity = [...analyzedDeals, ...analyzedResidential, ...analyzedADU]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 10)

  const totalProjects = deals.length + residentialProjects.length + aduProjects.length
  const totalValue = deals.reduce((s, d) => s + d.purchasePrice, 0) + residentialProjects.reduce((s, p) => s + p.purchasePrice, 0) + aduProjects.reduce((s, p) => s + p.purchasePrice + p.constructionCost, 0)
  const totalStrategies = (deals.length > 0 ? 1 : 0) + (residentialProjects.length > 0 ? 1 : 0) + (aduProjects.length > 0 ? 1 : 0)

  return (
    <div className="fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <p className="page-eyebrow">Rational Build</p>
          <h1 className="page-title">Investment Dashboard</h1>
          <p className="page-description">All investment strategies at a glance</p>
        </div>
      </div>

      {/* Aggregate Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard
          label="Total Projects"
          value={String(totalProjects)}
          sub="Across all strategies"
          icon={<Briefcase size={16} />}
        />
        <StatCard
          label="Active Strategies"
          value={String(totalStrategies)}
          sub="Multifamily, Residential"
          icon={<TrendingUp size={16} />}
        />
        <StatCard
          label="Portfolio Value"
          value={totalValue >= 1_000_000 ? `$${(totalValue / 1_000_000).toFixed(1)}M` : formatCurrency(totalValue)}
          sub="Total acquisition cost"
        />
      </div>

      {/* Strategy Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20, marginBottom: 32 }}>
        <StrategyCard
          title="Multifamily"
          description="Apartment buildings & multi-unit properties"
          href="/multifamily"
          icon={<Building2 size={20} />}
          count={deals.length}
          ctaLabel="New Analysis"
        />
        <StrategyCard
          title="Residential Flip & BRRR"
          description="Single family flip vs buy-renovate-rent-refinance"
          href="/residential"
          icon={<Home size={20} />}
          count={residentialProjects.length}
          ctaLabel="New Analysis"
        />
        <StrategyCard
          title="ADU Development"
          description="San Diego Bonus ADU — feasibility + 10-year model"
          href="/adu"
          icon={<Hammer size={20} />}
          count={aduProjects.length}
          ctaLabel="New Analysis"
        />
      </div>

      {/* Recent Activity Table */}
      {recentActivity.length > 0 && (
        <div className="data-table-wrapper">
          <div className="data-table-header">
            <div>
              <p className="card-title">Recent Activity</p>
              <p className="card-subtitle">Latest projects across all strategies</p>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Strategy</th>
                  <th>Price</th>
                  <th style={{ textAlign: 'center' }}>Rating</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((item, i) => (
                  <tr key={`${item.type}-${i}`}>
                    <td>
                      <Link href={item.href} className="deal-row-link">
                        <div className="deal-row-name truncate-line">{item.name}</div>
                        <div className="table-cell-muted" style={{ marginTop: 2 }}>{item.neighborhood}</div>
                      </Link>
                    </td>
                    <td>
                      <span className="badge" style={{ textTransform: 'capitalize' }}>
                        {item.type === 'multifamily' ? 'Multifamily' : item.type === 'residential' ? 'Flip / BRRR' : 'ADU'}
                      </span>
                    </td>
                    <td className="num">{formatCurrency(item.price)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <RecBadge rec={item.recommendation} />
                    </td>
                    <td className="num table-cell-muted">
                      {new Date(item.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
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
