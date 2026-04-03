import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { assessFeasibility } from '@/lib/finance/adu-feasibility'
import { analyzeADU } from '@/lib/finance/adu'
import { formatCurrency, formatPercent, formatMultiple } from '@/lib/formatters'
import { PrintButton } from '@/components/report/PrintButton'

export const dynamic = 'force-dynamic'

export default async function ADUReportPage({ params }: { params: Promise<{ id: string }> }) {
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

  const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const rec = analysis.recommendation

  return (
    <div className="report-page">
      <PrintButton backHref={`/adu/${id}`} />

      <div className="report-body">
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

        {/* Title */}
        <div className="report-title-block">
          <h1 className="report-title">{p.name}</h1>
          {p.address && <p className="report-address">{p.address}</p>}
          {p.neighborhood && <p className="report-neighborhood">{p.neighborhood}</p>}
          <p className="report-strategy-label">Bonus ADU Development · {p.aduCount}-Unit Program</p>
        </div>

        {/* Executive Summary */}
        <div className="report-section">
          <h2 className="report-section-title">Executive Summary</h2>
          <p className="report-prose">
            Rational Build Design has identified <strong>{p.name}</strong>
            {p.neighborhood ? ` in ${p.neighborhood}` : ''} as a{' '}
            <strong>{p.aduCount}-unit Bonus ADU development opportunity</strong> under California&apos;s SB 9 / AB 2221 framework.
            The project has a feasibility score of <strong>{feasibility.totalScore}/100</strong> ({feasibility.flag}) and projects
            an unlevered IRR of <strong>{formatPercent(analysis.irr)}</strong> over a <strong>{p.holdPeriodYears}-year hold</strong>,
            with total project cost of <strong>{formatCurrency(analysis.totalProjectCost)}</strong>.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="report-kpi-row">
          <div className="report-kpi">
            <div className="report-kpi-value">{formatPercent(analysis.irr)}</div>
            <div className="report-kpi-label">Unlevered IRR</div>
          </div>
          <div className="report-kpi">
            <div className="report-kpi-value">{formatMultiple(analysis.equityMultiple)}</div>
            <div className="report-kpi-label">Equity Multiple</div>
          </div>
          <div className="report-kpi">
            <div className="report-kpi-value">{formatCurrency(analysis.year1NOI)}</div>
            <div className="report-kpi-label">Year 1 NOI</div>
          </div>
          <div className="report-kpi">
            <div className="report-kpi-value">{formatCurrency(analysis.exitValue)}</div>
            <div className="report-kpi-label">Exit Value</div>
          </div>
          <div className="report-kpi">
            <div className="report-kpi-value">{feasibility.totalScore}/100</div>
            <div className="report-kpi-label">Feasibility Score</div>
          </div>
          <div className="report-kpi">
            <div className={`report-kpi-value report-rec-${rec.toLowerCase().replace(' ', '-')}`}>{rec}</div>
            <div className="report-kpi-label">Rating</div>
          </div>
        </div>

        {/* Project Overview */}
        <div className="report-section">
          <h2 className="report-section-title">Project Overview</h2>
          <table className="report-table">
            <tbody>
              <tr><td>Purchase Price</td><td>{formatCurrency(p.purchasePrice)}</td></tr>
              <tr><td>Construction Cost</td><td>{formatCurrency(p.constructionCost)}</td></tr>
              <tr className="report-table-total"><td>Total Project Cost</td><td>{formatCurrency(analysis.totalProjectCost)}</td></tr>
              <tr><td>ADU Count</td><td>{p.aduCount} units</td></tr>
              <tr><td>Market Rate Units</td><td>{p.marketRateUnits} @ {formatCurrency(p.marketRateRent)}/mo</td></tr>
              <tr><td>Middle Income Units</td><td>{p.middleIncomeUnits} @ {formatCurrency(p.middleIncomeRent)}/mo</td></tr>
              <tr><td>Year 1 Monthly Rent</td><td>{formatCurrency(analysis.year1MonthlyRent)}</td></tr>
              <tr><td>Hold Period</td><td>{p.holdPeriodYears} years</td></tr>
              <tr><td>Exit Cap Rate</td><td>{formatPercent(p.exitCapRate)}</td></tr>
            </tbody>
          </table>
        </div>

        {/* Feasibility */}
        <div className="report-section">
          <h2 className="report-section-title">Feasibility Assessment</h2>
          <table className="report-table">
            <thead>
              <tr><th style={{ textAlign: 'left' }}>Category</th><th>Score</th><th>Result</th></tr>
            </thead>
            <tbody>
              {feasibility.categories.map(cat => (
                <tr key={cat.label}>
                  <td>{cat.label}</td>
                  <td>{cat.score} / {cat.maxScore}</td>
                  <td style={{ color: cat.flag === 'pass' ? '#16a34a' : cat.flag === 'caution' ? '#d97706' : '#dc2626', fontWeight: 600 }}>
                    {cat.flag.toUpperCase()}
                  </td>
                </tr>
              ))}
              <tr className="report-table-total"><td>Total</td><td>{feasibility.totalScore} / 100</td><td style={{ fontWeight: 700 }}>{feasibility.flag}</td></tr>
            </tbody>
          </table>
        </div>

        {/* Pro Forma */}
        <div className="report-section">
          <h2 className="report-section-title">{p.holdPeriodYears}-Year Pro Forma</h2>
          <table className="report-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Year</th>
                <th>Gross Rent</th>
                <th>Vacancy Loss</th>
                <th>Op. Expenses</th>
                <th>NOI</th>
                <th>Cum. Cash Flow</th>
              </tr>
            </thead>
            <tbody>
              {analysis.proForma.map(row => (
                <tr key={row.year}>
                  <td>{row.year}</td>
                  <td>{formatCurrency(row.grossRent)}</td>
                  <td>({formatCurrency(row.vacancyLoss)})</td>
                  <td>({formatCurrency(row.opEx)})</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(row.noi)}</td>
                  <td>{formatCurrency(row.cumulativeCashFlow)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Investor Waterfall */}
        <div className="report-section">
          <h2 className="report-section-title">Investor Waterfall</h2>
          <p className="report-prose">
            LP equity receives a <strong>{formatPercent(p.preferredReturnRate)} compound preferred return</strong> on invested capital,
            followed by return of capital, with remaining profits split <strong>{formatPercent(1 - p.sponsorSplit)} LP / {formatPercent(p.sponsorSplit)} Sponsor</strong>.
          </p>
          <table className="report-table" style={{ marginTop: 16 }}>
            <tbody>
              <tr><td>LP Equity Invested</td><td>{formatCurrency(p.equityInvested)}</td></tr>
              <tr><td>LP Preferred Return Paid</td><td>{formatCurrency(analysis.lpPreferredPaid)}</td></tr>
              <tr><td>LP Capital Returned</td><td>{formatCurrency(analysis.lpCapitalReturned)}</td></tr>
              <tr><td>LP Profit Share</td><td>{formatCurrency(analysis.investorProfit)}</td></tr>
              <tr className="report-table-total"><td>Total LP Proceeds</td><td>{formatCurrency(analysis.lpPreferredPaid + analysis.lpCapitalReturned + analysis.investorProfit)}</td></tr>
              <tr><td>Sponsor Profit</td><td>{formatCurrency(analysis.sponsorProfit)}</td></tr>
            </tbody>
          </table>
        </div>

        <div className="report-disclosure">
          <p>This document has been prepared by Rational Build Design for informational purposes only and does not constitute an offer to sell or a solicitation of an offer to buy any security. All projections are based on assumptions that may not be realized. Prospective investors should conduct their own due diligence prior to making any investment decision.</p>
        </div>

        <div className="report-footer">
          <span>Rational Build Design · Investment Dashboard</span>
          <span>Confidential — Do Not Distribute</span>
        </div>
      </div>
    </div>
  )
}
