import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { assessFeasibility } from '@/lib/finance/adu-feasibility'
import { analyzeADU } from '@/lib/finance/adu'
import { formatCurrency, formatPercent, formatMultiple } from '@/lib/formatters'
import {
  ArrowLeft, Building2, CheckCircle2, DollarSign,
  TrendingUp, BarChart2, Edit,
} from 'lucide-react'

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

function CategoryFlagBadge({ flag }: { flag: 'pass' | 'caution' | 'fail' }) {
  if (flag === 'pass') return <span className="badge badge-success" style={{ fontSize: 11 }}>Pass</span>
  if (flag === 'caution') return <span className="badge badge-warning" style={{ fontSize: 11 }}>Caution</span>
  return <span className="badge badge-danger" style={{ fontSize: 11 }}>Fail</span>
}

function MetricCard({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className="card" style={{ padding: '16px 20px' }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 700, color: highlight ? 'var(--color-brand)' : 'var(--color-text-primary)', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 4 }}>{sub}</p>}
    </div>
  )
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value && value !== 0) return null
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 14, color: 'var(--color-text-primary)', fontWeight: 500 }}>{value}</p>
    </div>
  )
}

function SectionHeader({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      <span style={{ color: 'var(--color-brand)' }}>{icon}</span>
      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
    </div>
  )
}

export default async function ADUDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const p = await prisma.aDUProject.findUnique({ where: { id } })
  if (!p) notFound()

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

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <Link href="/adu" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 8, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to Portfolio
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h1 className="page-title" style={{ marginBottom: 0 }}>{p.name}</h1>
            <FlagBadge flag={feasibility.flag} />
            <RecBadge rec={analysis.recommendation} />
          </div>
          {p.address && <p className="page-description" style={{ marginTop: 4 }}>{p.address}</p>}
          {p.neighborhood && <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)', marginTop: 2 }}>{p.neighborhood}</p>}
        </div>
        <div style={{ flexShrink: 0 }}>
          <Link href={`/adu/new?id=${p.id}`} className="btn btn-outline">
            <Edit size={14} />
            Edit Inputs
          </Link>
        </div>
      </div>

      {/* Top metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
        <MetricCard label="IRR" value={formatPercent(analysis.irr)} highlight />
        <MetricCard label="Equity Multiple" value={formatMultiple(analysis.equityMultiple)} />
        <MetricCard label="Feasibility Score" value={`${feasibility.totalScore} / 100`} />
        <MetricCard label="Year 1 NOI" value={formatCurrency(analysis.year1NOI)} />
        <MetricCard label="Exit Value" value={formatCurrency(analysis.exitValue)} sub={`Cap rate: ${(p.exitCapRate * 100).toFixed(1)}%`} />
        <MetricCard label="Total Project Cost" value={formatCurrency(analysis.totalProjectCost)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Property Inputs */}
          <div className="card" style={{ padding: 24 }}>
            <SectionHeader title="Property & Project Inputs" icon={<Building2 size={14} />} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Purchase Price" value={formatCurrency(p.purchasePrice)} />
              <Field label="Construction Cost" value={formatCurrency(p.constructionCost)} />
              <Field label="ADU Count" value={p.aduCount} />
              <Field label="Hold Period" value={`${p.holdPeriodYears} years`} />
              <Field label="Zoning Code" value={p.zoningCode} />
              <Field label="Lot Size" value={`${p.lotSizeSqft.toLocaleString()} sqft`} />
              <Field label="Existing Coverage" value={`${p.existingCoverageSqft.toLocaleString()} sqft`} />
              <Field label="Permit Timeline" value={`${p.permitTimelineMonths} months`} />
              <Field label="Permit Cost" value={formatCurrency(p.permitCostEstimate)} />
              <Field label="HOA" value={p.hasHOA ? 'Yes' : 'No'} />
              <Field label="Water Utility" value={p.utilityWater === 'adequate' ? 'Adequate' : 'Needs Upgrade'} />
              <Field label="Sewer Utility" value={p.utilitySewer === 'adequate' ? 'Adequate' : 'Needs Upgrade'} />
            </div>
          </div>

          {/* Rent Assumptions */}
          <div className="card" style={{ padding: 24 }}>
            <SectionHeader title="Rent & Income Assumptions" icon={<DollarSign size={14} />} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Market Rate Units" value={p.marketRateUnits} />
              <Field label="Market Rate Rent / unit" value={formatCurrency(p.marketRateRent)} />
              <Field label="Middle Income Units" value={p.middleIncomeUnits} />
              <Field label="Middle Income Rent / unit" value={formatCurrency(p.middleIncomeRent)} />
              <Field label="Year 1 Monthly Rent" value={formatCurrency(analysis.year1MonthlyRent)} />
              <Field label="Annual Rent Growth" value={formatPercent(p.annualRentGrowth)} />
              <Field label="Vacancy Rate" value={formatPercent(p.vacancyRate)} />
              <Field label="Op Expense Ratio" value={formatPercent(p.opExpRatio)} />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Feasibility Breakdown */}
          <div className="card" style={{ padding: 24 }}>
            <SectionHeader title="Feasibility Breakdown" icon={<CheckCircle2 size={14} />} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {feasibility.categories.map(cat => (
                <div key={cat.label} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{cat.label}</p>
                      <CategoryFlagBadge flag={cat.flag} />
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>{cat.score} / {cat.maxScore}</p>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', lineHeight: 1.5 }}>{cat.notes}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Investor Waterfall */}
          <div className="card" style={{ padding: 24 }}>
            <SectionHeader title="Investor Waterfall" icon={<TrendingUp size={14} />} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Equity Invested" value={formatCurrency(p.equityInvested)} />
              <Field label="Preferred Return" value={formatPercent(p.preferredReturnRate)} />
              <Field label="Sponsor Split" value={formatPercent(p.sponsorSplit)} />
              <Field label="LP Preferred Paid" value={formatCurrency(analysis.lpPreferredPaid)} />
              <Field label="LP Capital Returned" value={formatCurrency(analysis.lpCapitalReturned)} />
              <Field label="Investor Profit" value={formatCurrency(analysis.investorProfit)} />
              <Field label="Sponsor Profit" value={formatCurrency(analysis.sponsorProfit)} />
            </div>
          </div>

          {/* Pro Forma Summary */}
          <div className="card" style={{ padding: 24 }}>
            <SectionHeader title="Pro Forma Summary" icon={<BarChart2 size={14} />} />
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ fontSize: 12 }}>
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>Gross Rent</th>
                    <th>NOI</th>
                    <th>Cum. Cash Flow</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.proForma.map(row => (
                    <tr key={row.year}>
                      <td className="num">{row.year}</td>
                      <td className="num">{formatCurrency(row.grossRent)}</td>
                      <td className="num table-cell-primary">{formatCurrency(row.noi)}</td>
                      <td className="num">{formatCurrency(row.cumulativeCashFlow)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 8, fontSize: 12, color: 'var(--color-text-tertiary)' }}>
        Last updated {new Date(p.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </div>
    </div>
  )
}
