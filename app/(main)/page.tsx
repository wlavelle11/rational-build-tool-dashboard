import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/formatters'
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
    prisma.deal.findMany({
      orderBy: { updatedAt: 'desc' },
      select: { id: true, name: true, neighborhood: true, purchasePrice: true, updatedAt: true, cachedRecommendation: true },
    }),
    prisma.residentialProject.findMany({
      orderBy: { updatedAt: 'desc' },
      select: { id: true, name: true, neighborhood: true, purchasePrice: true, updatedAt: true, cachedFlipRec: true },
    }),
    prisma.aDUProject.findMany({
      orderBy: { updatedAt: 'desc' },
      select: { id: true, name: true, neighborhood: true, purchasePrice: true, constructionCost: true, updatedAt: true, cachedRecommendation: true },
    }),
  ])

  const recentActivity = [
    ...deals.map(d => ({
      type: 'multifamily' as const,
      name: d.name, neighborhood: d.neighborhood,
      price: d.purchasePrice,
      recommendation: d.cachedRecommendation ?? 'Pass',
      updatedAt: d.updatedAt,
      href: `/multifamily/${d.id}`,
    })),
    ...residentialProjects.map(p => ({
      type: 'residential' as const,
      name: p.name, neighborhood: p.neighborhood,
      price: p.purchasePrice,
      recommendation: p.cachedFlipRec ?? 'Pass',
      updatedAt: p.updatedAt,
      href: '/residential',
    })),
    ...aduProjects.map(p => ({
      type: 'adu' as const,
      name: p.name, neighborhood: p.neighborhood,
      price: p.purchasePrice + p.constructionCost,
      recommendation: p.cachedRecommendation ?? 'Pass',
      updatedAt: p.updatedAt,
      href: '/adu',
    })),
  ]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 10)

  const totalProjects = deals.length + residentialProjects.length + aduProjects.length
  const totalValue =
    deals.reduce((s, d) => s + d.purchasePrice, 0) +
    residentialProjects.reduce((s, p) => s + p.purchasePrice, 0) +
    aduProjects.reduce((s, p) => s + p.purchasePrice + p.constructionCost, 0)
  const totalStrategies =
    (deals.length > 0 ? 1 : 0) +
    (residentialProjects.length > 0 ? 1 : 0) +
    (aduProjects.length > 0 ? 1 : 0)

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <p className="page-eyebrow">Rational Build</p>
          <h1 className="page-title">Investment Dashboard</h1>
          <p className="page-description">All investment strategies at a glance</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Total Projects" value={String(totalProjects)} sub="Across all strategies" icon={<Briefcase size={16} />} />
        <StatCard label="Active Strategies" value={String(totalStrategies)} sub="Multifamily, Residential, ADU" icon={<TrendingUp size={16} />} />
        <StatCard
          label="Portfolio Value"
          value={totalValue >= 1_000_000 ? `$${(totalValue / 1_000_000).toFixed(1)}M` : formatCurrency(totalValue)}
          sub="Total acquisition cost"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20, marginBottom: 32 }}>
        <StrategyCard title="Multifamily" description="Apartment buildings & multi-unit properties" href="/multifamily" icon={<Building2 size={20} />} count={deals.length} ctaLabel="New Analysis" />
        <StrategyCard title="Residential Flip & BRRR" description="Single family flip vs buy-renovate-rent-refinance" href="/residential" icon={<Home size={20} />} count={residentialProjects.length} ctaLabel="New Analysis" />
        <StrategyCard title="ADU Development" description="San Diego Bonus ADU — feasibility + 10-year model" href="/adu" icon={<Hammer size={20} />} count={aduProjects.length} ctaLabel="New Analysis" />
      </div>

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
                    <td style={{ textAlign: 'center' }}><RecBadge rec={item.recommendation} /></td>
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
