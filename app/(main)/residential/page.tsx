import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { calculateFlip } from '@/lib/finance/flip'
import { calculateBRRR } from '@/lib/finance/brrr'
import { formatCurrency, formatPercent } from '@/lib/formatters'
import { Plus, Home, TrendingUp, DollarSign } from 'lucide-react'
import { StatCard } from '@/components/ui/stat-card'

export const dynamic = 'force-dynamic'

function RecBadge({ rec }: { rec: string }) {
  const cfg: Record<string, { cls: string }> = {
    'Strong Buy': { cls: 'badge badge-success' },
    'Caution':    { cls: 'badge badge-warning' },
    'Pass':       { cls: 'badge badge-danger' },
  }
  const c = cfg[rec] ?? { cls: 'badge badge-neutral' }
  return (
    <span className={c.cls}>
      <span className="badge-dot" />
      {rec}
    </span>
  )
}

export default async function ResidentialPage() {
  const projects = await prisma.residentialProject.findMany({ orderBy: { updatedAt: 'desc' } })

  const analyzed = projects.map((p) => {
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
    const brrr = calculateBRRR({
      purchasePrice: p.purchasePrice,
      renovationBudget: p.renovationBudget,
      arv: p.arv,
      buyClosingCosts: p.buyClosingCosts,
      holdPeriodYears: p.brrrHoldYears,
      investorCapital: p.brrrInvestorCapital,
      targetCashYieldPct: p.brrrTargetYield,
      equitySplitAtSalePct: p.brrrEquitySplit,
      monthlyRent: p.brrrMonthlyRent,
      operatingExpenseRatio: p.brrrOpExpRatio,
      operatingReservePct: p.brrrReservePct,
      refinanceLtv: p.brrrRefinanceLtv,
      refinanceRate: p.brrrRefinanceRate,
      refinanceLoanTermYears: p.brrrRefinanceTerm,
      financingType: p.brrrFinancingType as 'cash' | 'hard_money',
      hardMoneyLtvPct: p.brrrHardMoneyLtvPct ?? undefined,
      hardMoneyRate: p.brrrHardMoneyRate ?? undefined,
      hardMoneyPoints: p.brrrHardMoneyPoints ?? undefined,
      renovationMonths: p.brrrRenovationMonths ?? undefined,
    })
    return { project: p, flip, brrr }
  })

  const totalProjects = projects.length
  const avgFlipROI = analyzed.length > 0
    ? analyzed.reduce((s, d) => s + d.flip.annualizedRoi, 0) / analyzed.length
    : 0
  const avgCashYield = analyzed.length > 0
    ? analyzed.reduce((s, d) => s + d.brrr.actualCashYield, 0) / analyzed.length
    : 0
  const totalPipeline = projects.reduce((s, p) => s + p.purchasePrice, 0)

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <p className="page-eyebrow">Portfolio</p>
          <h1 className="page-title">Residential Deal Portfolio</h1>
          <p className="page-description">Compare Flip vs BRRR strategies for each property</p>
        </div>
        <Link href="/residential/new" className="btn btn-primary">
          <Plus size={15} />
          New Analysis
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Total Projects" value={String(totalProjects)} sub="In pipeline" icon={<Home size={16} />} />
        <StatCard
          label="Avg Flip ROI (ann.)"
          value={formatPercent(avgFlipROI)}
          sub="Annualized"
          trend={avgFlipROI >= 0.30 ? 'positive' : avgFlipROI >= 0.20 ? 'warning' : 'negative'}
          icon={<TrendingUp size={16} />}
        />
        <StatCard
          label="Avg BRRR Cash Yield"
          value={formatPercent(avgCashYield)}
          sub="vs 8% target"
          trend={avgCashYield >= 0.08 ? 'positive' : avgCashYield >= 0.06 ? 'warning' : 'negative'}
          icon={<DollarSign size={16} />}
        />
        <StatCard
          label="Pipeline Value"
          value={totalPipeline >= 1_000_000 ? `$${(totalPipeline / 1_000_000).toFixed(1)}M` : formatCurrency(totalPipeline)}
          sub="Total acquisition cost"
        />
      </div>

      {projects.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><Home size={24} /></div>
            <p className="empty-state-title">No residential projects yet</p>
            <p className="empty-state-desc">Add a property to compare Flip vs BRRR strategies side by side.</p>
            <Link href="/residential/new" className="btn btn-primary" style={{ marginTop: 8 }}>
              <Plus size={15} />
              Create first analysis
            </Link>
          </div>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <div className="data-table-header">
            <div>
              <p className="card-title">Active Projects</p>
              <p className="card-subtitle">{totalProjects} project{totalProjects !== 1 ? 's' : ''} in pipeline</p>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Purchase</th>
                  <th>ARV</th>
                  <th>Flip ROI</th>
                  <th>Flip Rec.</th>
                  <th>BRRR Yield</th>
                  <th>BRRR Dist./mo</th>
                  <th>BRRR Rec.</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {analyzed.map(({ project, flip, brrr }) => (
                  <tr key={project.id}>
                    <td>
                      <div className="deal-row-name truncate-line">{project.name}</div>
                      <div className="table-cell-muted" style={{ marginTop: 2 }}>{project.neighborhood}</div>
                    </td>
                    <td className="num">{formatCurrency(project.purchasePrice)}</td>
                    <td className="num">{formatCurrency(project.arv)}</td>
                    <td className="num table-cell-primary">{formatPercent(flip.annualizedRoi)}</td>
                    <td><RecBadge rec={flip.recommendation} /></td>
                    <td className="num table-cell-primary">{formatPercent(brrr.actualCashYield)}</td>
                    <td className="num">{formatCurrency(brrr.monthlyInvestorDistribution)}</td>
                    <td><RecBadge rec={brrr.recommendation} /></td>
                    <td className="num table-cell-muted">
                      {new Date(project.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
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
