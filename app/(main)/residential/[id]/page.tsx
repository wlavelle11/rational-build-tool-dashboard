import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { calculateFlip } from '@/lib/finance/flip'
import { calculateBRRR } from '@/lib/finance/brrr'
import { formatCurrency, formatPercent } from '@/lib/formatters'
import { ArrowLeft, Home, DollarSign, TrendingUp, BarChart2, RefreshCw, Edit, FileText } from 'lucide-react'

export const dynamic = 'force-dynamic'

function RecBadge({ rec }: { rec: string }) {
  const cfg: Record<string, string> = {
    'Strong Buy': 'badge badge-success',
    'Caution': 'badge badge-warning',
    'Pass': 'badge badge-danger',
  }
  return <span className={cfg[rec] ?? 'badge badge-neutral'}><span className="badge-dot" />{rec}</span>
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

export default async function ResidentialDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const p = await prisma.residentialProject.findUnique({ where: { id } })
  if (!p) notFound()

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

  const editHref = `/residential/new?id=${p.id}`

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <Link href="/residential" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 8, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to Portfolio
          </Link>
          <h1 className="page-title" style={{ marginBottom: 0 }}>{p.name}</h1>
          {p.address && <p className="page-description" style={{ marginTop: 4 }}>{p.address}</p>}
          {p.neighborhood && <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)', marginTop: 2 }}>{p.neighborhood}</p>}
        </div>
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          <Link href={editHref} className="btn btn-outline">
            <Edit size={14} />
            Edit Inputs
          </Link>
          <Link href={`/residential/${p.id}/report`} className="btn btn-primary">
            <FileText size={14} />
            Investor Report
          </Link>
        </div>
      </div>

      {/* Property Inputs Summary */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <SectionHeader title="Property Inputs" icon={<Home size={15} />} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 20 }}>
          <Field label="Purchase Price" value={formatCurrency(p.purchasePrice)} />
          <Field label="Renovation Budget" value={formatCurrency(p.renovationBudget)} />
          <Field label="ARV" value={formatCurrency(p.arv)} />
          <Field label="Buy Closing Costs" value={formatCurrency(p.buyClosingCosts)} />
          {p.address && <Field label="Address" value={p.address} />}
          {p.neighborhood && <Field label="Neighborhood" value={p.neighborhood} />}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Flip Strategy */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>Flip Strategy</h2>
            <RecBadge rec={flip.recommendation} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <MetricCard label="Annualized ROI" value={formatPercent(flip.annualizedRoi)} highlight />
            <MetricCard label="Deal Score" value={`${flip.dealScore} / 100`} />
            <MetricCard label="Gross Profit" value={formatCurrency(flip.grossProfit)} />
            <MetricCard label="Profit Margin" value={formatPercent(flip.profitMargin)} />
          </div>

          <div className="card" style={{ padding: 20 }}>
            <SectionHeader title="Flip Economics" icon={<DollarSign size={14} />} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Total Project Cost" value={formatCurrency(flip.totalProjectCost)} />
              <Field label="Net Sale Proceeds" value={formatCurrency(flip.netSaleProceeds)} />
              <Field label="Sell Closing Costs" value={formatCurrency(flip.sellClosingCosts)} />
              {flip.hardMoneyCosts > 0 && <Field label="Hard Money Costs" value={formatCurrency(flip.hardMoneyCosts)} />}
              <Field label="Hold Period" value={`${p.flipHoldMonths} months`} />
              <Field label="Financing" value={p.flipFinancingType === 'hard_money' ? 'Hard Money' : 'Cash'} />
            </div>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <SectionHeader title="Investor Returns" icon={<TrendingUp size={14} />} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Investor Capital" value={formatCurrency(p.flipInvestorCapital)} />
              <Field label="Loan Fee (1%)" value={formatCurrency(flip.loanFee)} />
              <Field label="Interest (10%)" value={formatCurrency(flip.interest)} />
              <Field label="Profit Share (33%)" value={formatCurrency(flip.investorProfitShare)} />
              <Field label="Total Investor Return" value={formatCurrency(flip.totalInvestorReturn)} />
              <Field label="Simple ROI" value={formatPercent(flip.roi)} />
            </div>
          </div>
        </div>

        {/* BRRR Strategy */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>BRRR Strategy</h2>
            <RecBadge rec={brrr.recommendation} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <MetricCard label="Cash Yield" value={formatPercent(brrr.actualCashYield)} highlight />
            <MetricCard label="Deal Score" value={`${brrr.dealScore} / 100`} />
            <MetricCard label="Monthly Distribution" value={formatCurrency(brrr.monthlyInvestorDistribution)} />
            <MetricCard label="Total ROI" value={formatPercent(brrr.totalROI)} />
          </div>

          <div className="card" style={{ padding: 20 }}>
            <SectionHeader title="Cash Flow" icon={<BarChart2 size={14} />} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Monthly Gross Rent" value={formatCurrency(brrr.monthlyGrossRent)} />
              <Field label="Operating Expenses" value={formatCurrency(brrr.monthlyOperatingExpenses)} />
              <Field label="Reserve" value={formatCurrency(brrr.monthlyReserve)} />
              <Field label="Mortgage" value={formatCurrency(brrr.monthlyMortgage)} />
              <Field label="Net Cash Flow / mo" value={formatCurrency(brrr.monthlyNetCashFlow)} />
              <Field label="Annual Gross Rent" value={formatCurrency(brrr.annualGrossRent)} />
            </div>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <SectionHeader title="Refinance & Hold" icon={<RefreshCw size={14} />} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Refinance Loan" value={formatCurrency(brrr.refinanceLoanAmount)} />
              <Field label="Capital Returned" value={formatCurrency(brrr.capitalReturnedViaRefi)} />
              <Field label="Capital at Risk" value={formatCurrency(brrr.remainingCapitalAtRisk)} />
              <Field label="Hold Period" value={`${p.brrrHoldYears} years`} />
              <Field label="Refi Rate" value={formatPercent(p.brrrRefinanceRate)} />
              <Field label="Refi LTV" value={formatPercent(p.brrrRefinanceLtv)} />
              <Field label="Total Distributions" value={formatCurrency(brrr.totalDistributions)} />
              <Field label="Equity at Sale" value={formatCurrency(brrr.equityAtSale)} />
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
