import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { assessFeasibility } from '@/lib/finance/adu-feasibility'
import { analyzeADU } from '@/lib/finance/adu'
import { formatCurrency, formatPercent, formatMultiple } from '@/lib/formatters'
import { Plus, CheckCircle2, Building2 } from 'lucide-react'
import { StatCard } from '@/components/ui/stat-card'

export const dynamic = 'force-dynamic'

function FlagBadge({ flag }: { flag: string }) {
  if (flag === 'GO') return <span className="badge badge-success"><span className="badge-dot" />GO</span>
  if (flag === 'CAUTION') return <span className="badge badge-warning"><span className="badge-dot" />CAUTION</span>
  return <span className="badge badge-danger"><span className="badge-dot" />NO-GO</span>
}

function RecBadge({ rec }: { rec: string }) {
  const cfg: Record<string, string> = { 'Strong Buy': 'badge badge-success', 'Caution': 'badge badge-warning', 'Pass': 'badge badge-danger' }
  return <span className={cfg[rec] ?? 'badge badge-neutral'}><span className="badge-dot" />{rec}</span>
}

export default async function ADUPage() {
  const projects = await prisma.aDUProject.findMany({ orderBy: { updatedAt: 'desc' } })

  const analyzed = projects.map((p) => {
    const feasibility = assessFeasibility({
      lotSizeSqft: p.lotSizeSqft, existingCoverageSqft: p.existingCoverageSqft,
      zoningCode: p.zoningCode, aduCount: p.aduCount,
      setbackFront: p.setbackFront, setbackRear: p.setbackRear, setbackSide: p.setbackSide,
      utilityWater: p.utilityWater as 'adequate' | 'needs_upgrade',
      utilitySewer: p.utilitySewer as 'adequate' | 'needs_upgrade',
      hasHOA: p.hasHOA, permitTimelineMonths: p.permitTimelineMonths, permitCostEstimate: p.permitCostEstimate,
    })
    const analysis = analyzeADU({
      purchasePrice: p.purchasePrice, constructionCost: p.constructionCost,
      aduCount: p.aduCount, marketRateUnits: p.marketRateUnits, middleIncomeUnits: p.middleIncomeUnits,
      marketRateRent: p.marketRateRent, middleIncomeRent: p.middleIncomeRent,
      vacancyRate: p.vacancyRate, opExpRatio: p.opExpRatio, annualRentGrowth: p.annualRentGrowth,
      holdPeriodYears: p.holdPeriodYears, exitCapRate: p.exitCapRate,
      equityInvested: p.equityInvested, preferredReturnRate: p.preferredReturnRate, sponsorSplit: p.sponsorSplit,
    })
    return { project: p, feasibility, analysis }
  })

  const goCount = analyzed.filter(a => a.feasibility.flag === 'GO').length
  const avgIRR = analyzed.length > 0 ? analyzed.reduce((s, a) => s + a.analysis.irr, 0) / analyzed.length : 0
  const totalValue = projects.reduce((s, p) => s + p.purchasePrice + p.constructionCost, 0)

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <p className="page-eyebrow">Portfolio</p>
          <h1 className="page-title">ADU Deal Portfolio</h1>
          <p className="page-description">San Diego Bonus ADU development — feasibility & 10-year financial analysis</p>
        </div>
        <Link href="/adu/new" className="btn btn-primary">
          <Plus size={15} />
          New Analysis
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Total Projects" value={String(projects.length)} sub="In portfolio" icon={<Building2 size={16} />} />
        <StatCard label="GO Properties" value={String(goCount)} sub="Passed feasibility" trend={goCount > 0 ? 'positive' : 'neutral'} icon={<CheckCircle2 size={16} />} />
        <StatCard label="Avg IRR" value={formatPercent(avgIRR)} sub="Unlevered" trend={avgIRR >= 0.10 ? 'positive' : avgIRR >= 0.07 ? 'warning' : 'negative'} />
        <StatCard label="Total Project Cost" value={totalValue >= 1_000_000 ? `$${(totalValue / 1_000_000).toFixed(1)}M` : formatCurrency(totalValue)} sub="Purchase + construction" />
      </div>

      {projects.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><Building2 size={24} /></div>
            <p className="empty-state-title">No ADU projects yet</p>
            <p className="empty-state-desc">Run feasibility and financial analysis on your first ADU development site.</p>
            <Link href="/adu/new" className="btn btn-primary" style={{ marginTop: 8 }}>
              <Plus size={15} />
              Start first analysis
            </Link>
          </div>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <div className="data-table-header">
            <div>
              <p className="card-title">ADU Projects</p>
              <p className="card-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''} analyzed</p>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>ADUs</th>
                  <th>Total Cost</th>
                  <th style={{ textAlign: 'center' }}>Feasibility</th>
                  <th>Feasibility Score</th>
                  <th>IRR</th>
                  <th>Equity Multiple</th>
                  <th style={{ textAlign: 'center' }}>Rating</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {analyzed.map(({ project, feasibility, analysis }) => (
                  <tr key={project.id}>
                    <td>
                      <Link href={`/adu/${project.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="deal-row-name truncate-line">{project.name}</div>
                      </Link>
                      <div className="table-cell-muted" style={{ marginTop: 2 }}>{project.neighborhood}</div>
                    </td>
                    <td className="num">{project.aduCount}</td>
                    <td className="num">{formatCurrency(project.purchasePrice + project.constructionCost)}</td>
                    <td style={{ textAlign: 'center' }}><FlagBadge flag={feasibility.flag} /></td>
                    <td className="num">{feasibility.totalScore}/100</td>
                    <td className="num table-cell-primary">{formatPercent(analysis.irr)}</td>
                    <td className="num">{formatMultiple(analysis.equityMultiple)}</td>
                    <td style={{ textAlign: 'center' }}><RecBadge rec={analysis.recommendation} /></td>
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
