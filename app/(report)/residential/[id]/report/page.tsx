import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { calculateFlip } from '@/lib/finance/flip'
import { calculateBRRR } from '@/lib/finance/brrr'
import { formatCurrency, formatPercent } from '@/lib/formatters'
import { PrintButton } from '@/components/report/PrintButton'

export const dynamic = 'force-dynamic'

export default async function ResidentialReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const p = await prisma.residentialProject.findUnique({ where: { id } })
  if (!p) notFound()

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

  const brrr = calculateBRRR({
    purchasePrice: p.purchasePrice, renovationBudget: p.renovationBudget, arv: p.arv,
    buyClosingCosts: p.buyClosingCosts, holdPeriodYears: p.brrrHoldYears,
    investorCapital: p.brrrInvestorCapital, targetCashYieldPct: p.brrrTargetYield,
    equitySplitAtSalePct: p.brrrEquitySplit, monthlyRent: p.brrrMonthlyRent,
    operatingExpenseRatio: p.brrrOpExpRatio, operatingReservePct: p.brrrReservePct,
    refinanceLtv: p.brrrRefinanceLtv, refinanceRate: p.brrrRefinanceRate,
    refinanceLoanTermYears: p.brrrRefinanceTerm,
    financingType: p.brrrFinancingType as 'cash' | 'hard_money',
    hardMoneyLtvPct: p.brrrHardMoneyLtvPct ?? undefined,
    hardMoneyRate: p.brrrHardMoneyRate ?? undefined,
    hardMoneyPoints: p.brrrHardMoneyPoints ?? undefined,
    renovationMonths: p.brrrRenovationMonths ?? undefined,
  })

  const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const flipRec = flip.recommendation
  const brrrRec = brrr.recommendation

  return (
    <div className="report-page">
      <PrintButton backHref={`/residential/${id}`} />

      <div className="report-body" id="report-content">
        {/* Header */}
        <div className="report-header">
          <div className="report-logo-block">
            <div className="report-logo-mark">RBD</div>
            <div>
              <div className="report-logo-name">Rational Build Design</div>
              <div className="report-logo-sub">Investment Opportunity</div>
            </div>
          </div>
          <div className="report-header-meta">
            <div className="report-confidential">CONFIDENTIAL</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Prepared {date}</div>
          </div>
        </div>

        <div className="report-divider" />

        {/* Title block */}
        <div className="report-title-block">
          <h1 className="report-title">{p.name}</h1>
          {p.address && <p className="report-address">{p.address}</p>}
          {p.neighborhood && <p className="report-neighborhood">{p.neighborhood}</p>}
          <p className="report-strategy-label">Residential Flip / BRRR Analysis</p>
        </div>

        {/* Executive Summary */}
        <div className="report-section">
          <h2 className="report-section-title">Executive Summary</h2>
          <p className="report-prose">
            Rational Build Design has identified <strong>{p.name}</strong> as a compelling residential investment opportunity
            {p.neighborhood ? ` in ${p.neighborhood}` : ''}. The property is being acquired at{' '}
            <strong>{formatCurrency(p.purchasePrice)}</strong> with an estimated after-repair value of{' '}
            <strong>{formatCurrency(p.arv)}</strong> following a <strong>{formatCurrency(p.renovationBudget)}</strong> renovation program.
            Two exit strategies are modeled below: a short-term flip and a BRRR hold strategy.
          </p>
        </div>

        {/* Key Metrics — side by side */}
        <div className="report-two-col">
          {/* Flip */}
          <div className="report-strategy-card">
            <div className="report-strategy-header">
              <span className="report-strategy-name">Flip Strategy</span>
              <span className={`report-rec report-rec-${flipRec.toLowerCase().replace(' ', '-')}`}>{flipRec}</span>
            </div>
            <div className="report-metrics-grid">
              <div className="report-metric">
                <div className="report-metric-label">Annualized ROI</div>
                <div className="report-metric-value">{formatPercent(flip.annualizedRoi)}</div>
              </div>
              <div className="report-metric">
                <div className="report-metric-label">Gross Profit</div>
                <div className="report-metric-value">{formatCurrency(flip.grossProfit)}</div>
              </div>
              <div className="report-metric">
                <div className="report-metric-label">Profit Margin</div>
                <div className="report-metric-value">{formatPercent(flip.profitMargin)}</div>
              </div>
              <div className="report-metric">
                <div className="report-metric-label">Hold Period</div>
                <div className="report-metric-value">{p.flipHoldMonths} months</div>
              </div>
              <div className="report-metric">
                <div className="report-metric-label">Investor Capital</div>
                <div className="report-metric-value">{formatCurrency(p.flipInvestorCapital)}</div>
              </div>
              <div className="report-metric">
                <div className="report-metric-label">Total Investor Return</div>
                <div className="report-metric-value highlight">{formatCurrency(flip.totalInvestorReturn)}</div>
              </div>
            </div>
          </div>

          {/* BRRR */}
          <div className="report-strategy-card">
            <div className="report-strategy-header">
              <span className="report-strategy-name">BRRR Strategy</span>
              <span className={`report-rec report-rec-${brrrRec.toLowerCase().replace(' ', '-')}`}>{brrrRec}</span>
            </div>
            <div className="report-metrics-grid">
              <div className="report-metric">
                <div className="report-metric-label">Cash Yield</div>
                <div className="report-metric-value">{formatPercent(brrr.actualCashYield)}</div>
              </div>
              <div className="report-metric">
                <div className="report-metric-label">Monthly Distribution</div>
                <div className="report-metric-value">{formatCurrency(brrr.monthlyInvestorDistribution)}</div>
              </div>
              <div className="report-metric">
                <div className="report-metric-label">Capital Returned (Refi)</div>
                <div className="report-metric-value">{formatCurrency(brrr.capitalReturnedViaRefi)}</div>
              </div>
              <div className="report-metric">
                <div className="report-metric-label">Hold Period</div>
                <div className="report-metric-value">{p.brrrHoldYears} years</div>
              </div>
              <div className="report-metric">
                <div className="report-metric-label">Investor Capital</div>
                <div className="report-metric-value">{formatCurrency(p.brrrInvestorCapital)}</div>
              </div>
              <div className="report-metric">
                <div className="report-metric-label">Total ROI</div>
                <div className="report-metric-value highlight">{formatPercent(brrr.totalROI)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Deal Economics */}
        <div className="report-section">
          <h2 className="report-section-title">Deal Economics</h2>
          <table className="report-table">
            <tbody>
              <tr><td>Purchase Price</td><td>{formatCurrency(p.purchasePrice)}</td></tr>
              <tr><td>Renovation Budget</td><td>{formatCurrency(p.renovationBudget)}</td></tr>
              <tr><td>Closing Costs</td><td>{formatCurrency(p.buyClosingCosts)}</td></tr>
              <tr className="report-table-total"><td>After-Repair Value (ARV)</td><td>{formatCurrency(p.arv)}</td></tr>
              <tr><td>Value Creation (ARV − All-In)</td><td>{formatCurrency(p.arv - p.purchasePrice - p.renovationBudget - p.buyClosingCosts)}</td></tr>
            </tbody>
          </table>
        </div>

        {/* Investor Return Structure */}
        <div className="report-section">
          <h2 className="report-section-title">Investor Return Structure (Flip)</h2>
          <p className="report-prose">
            Investor capital is structured as a secured loan with a 1% origination fee, 10% annualized interest during the hold period,
            and a 33.3% share of net project profits above basis. This aligns investor and sponsor incentives throughout the project.
          </p>
          <table className="report-table" style={{ marginTop: 16 }}>
            <tbody>
              <tr><td>Origination Fee (1%)</td><td>{formatCurrency(flip.loanFee)}</td></tr>
              <tr><td>Interest (10% annualized)</td><td>{formatCurrency(flip.interest)}</td></tr>
              <tr><td>Profit Share (33.3%)</td><td>{formatCurrency(flip.investorProfitShare)}</td></tr>
              <tr className="report-table-total"><td>Total Investor Return</td><td>{formatCurrency(flip.totalInvestorReturn)}</td></tr>
              <tr><td>Simple ROI</td><td>{formatPercent(flip.roi)}</td></tr>
              <tr><td>Annualized ROI</td><td>{formatPercent(flip.annualizedRoi)}</td></tr>
            </tbody>
          </table>
        </div>

        {/* Disclosure */}
        <div className="report-disclosure">
          <p>This document has been prepared by Rational Build Design for informational purposes only and does not constitute an offer to sell or a solicitation of an offer to buy any security. All projections are based on assumptions and estimates that may not be realized. Past performance is not indicative of future results. Prospective investors should conduct their own due diligence.</p>
        </div>

        <div className="report-footer">
          <span>Rational Build Design · Investment Dashboard</span>
          <span>Confidential — Do Not Distribute</span>
        </div>
      </div>
    </div>
  )
}
