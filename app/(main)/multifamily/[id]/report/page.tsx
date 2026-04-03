import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { analyzeDeal } from '@/lib/finance'
import { formatCurrency, formatPercent, formatMultiple } from '@/lib/formatters'
import { PrintButton } from '@/components/report/PrintButton'

export const dynamic = 'force-dynamic'

export default async function MultifamilyReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const deal = await prisma.deal.findUnique({ where: { id } })
  if (!deal) notFound()

  const inputs = {
    purchasePrice: deal.purchasePrice, monthlyGrossRent: deal.monthlyGrossRent,
    vacancyRate: deal.vacancyRate, operatingExpenseRatio: deal.operatingExpenseRatio,
    annualRentGrowth: deal.annualRentGrowth, annualExpenseGrowth: deal.annualExpenseGrowth,
    holdPeriodYears: deal.holdPeriodYears, exitCapRate: deal.exitCapRate,
    acquisitionClosingCosts: deal.acquisitionClosingCosts, renovationCapex: deal.renovationCapex,
    equityInvested: deal.equityInvested, preferredReturnRate: deal.preferredReturnRate,
    sponsorPromoteRate: deal.sponsorPromoteRate,
  }
  const metrics = analyzeDeal(inputs)

  const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const rec = metrics.recommendation
  const allInCost = deal.purchasePrice + deal.acquisitionClosingCosts + deal.renovationCapex
  const w = metrics.waterfall

  return (
    <div className="report-page">
      <PrintButton backHref={`/multifamily/${id}`} />

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
          <h1 className="report-title">{deal.name}</h1>
          {deal.address && <p className="report-address">{deal.address}</p>}
          <p className="report-neighborhood">{deal.neighborhood} · {deal.units} Units</p>
          <p className="report-strategy-label">Multifamily Acquisition · {deal.holdPeriodYears}-Year Hold</p>
        </div>

        {/* Executive Summary */}
        <div className="report-section">
          <h2 className="report-section-title">Executive Summary</h2>
          <p className="report-prose">
            Rational Build Design has identified <strong>{deal.name}</strong>, a <strong>{deal.units}-unit multifamily property</strong> in{' '}
            <strong>{deal.neighborhood}</strong>, as a compelling acquisition opportunity. The property is offered at{' '}
            <strong>{formatCurrency(deal.purchasePrice)}</strong> ({formatCurrency(deal.purchasePrice / deal.units)}/unit) with an
            all-in cost basis of <strong>{formatCurrency(allInCost)}</strong>. The investment projects a{' '}
            <strong>{formatPercent(metrics.irr)} IRR</strong> and <strong>{formatMultiple(metrics.equityMultiple)} equity multiple</strong>{' '}
            over the {deal.holdPeriodYears}-year hold period.
          </p>
        </div>

        {/* KPI Row */}
        <div className="report-kpi-row">
          <div className="report-kpi">
            <div className="report-kpi-value">{formatPercent(metrics.irr)}</div>
            <div className="report-kpi-label">IRR</div>
          </div>
          <div className="report-kpi">
            <div className="report-kpi-value">{formatMultiple(metrics.equityMultiple)}</div>
            <div className="report-kpi-label">Equity Multiple</div>
          </div>
          <div className="report-kpi">
            <div className="report-kpi-value">{formatPercent(metrics.year1CapRate)}</div>
            <div className="report-kpi-label">Year 1 Cap Rate</div>
          </div>
          <div className="report-kpi">
            <div className="report-kpi-value">{formatPercent(metrics.year1CashOnCash)}</div>
            <div className="report-kpi-label">Cash-on-Cash</div>
          </div>
          <div className="report-kpi">
            <div className="report-kpi-value">{formatCurrency(metrics.exitValuation)}</div>
            <div className="report-kpi-label">Exit Valuation</div>
          </div>
          <div className="report-kpi">
            <div className={`report-kpi-value report-rec-${rec.toLowerCase().replace(' ', '-')}`}>{rec}</div>
            <div className="report-kpi-label">Rating</div>
          </div>
        </div>

        {/* Deal Economics */}
        <div className="report-section">
          <h2 className="report-section-title">Deal Economics</h2>
          <table className="report-table">
            <tbody>
              <tr><td>Purchase Price</td><td>{formatCurrency(deal.purchasePrice)}</td></tr>
              <tr><td>Price Per Unit</td><td>{formatCurrency(deal.purchasePrice / deal.units)}</td></tr>
              <tr><td>Acquisition Closing Costs</td><td>{formatCurrency(deal.acquisitionClosingCosts)}</td></tr>
              <tr><td>Renovation / CapEx</td><td>{formatCurrency(deal.renovationCapex)}</td></tr>
              <tr className="report-table-total"><td>All-In Cost Basis</td><td>{formatCurrency(allInCost)}</td></tr>
              <tr><td>Equity Invested</td><td>{formatCurrency(deal.equityInvested)}</td></tr>
              <tr><td>Monthly Gross Rent</td><td>{formatCurrency(deal.monthlyGrossRent)}</td></tr>
              <tr><td>Vacancy Rate</td><td>{formatPercent(deal.vacancyRate)}</td></tr>
              <tr><td>Operating Expense Ratio</td><td>{formatPercent(deal.operatingExpenseRatio)}</td></tr>
              <tr><td>Year 1 NOI</td><td>{formatCurrency(metrics.year1NOI)}</td></tr>
              <tr><td>Exit Cap Rate</td><td>{formatPercent(deal.exitCapRate)}</td></tr>
              <tr><td>Exit Valuation</td><td>{formatCurrency(metrics.exitValuation)}</td></tr>
              <tr><td>Total Value Creation</td><td>{formatCurrency(metrics.totalValueCreation)}</td></tr>
            </tbody>
          </table>
        </div>

        {/* Pro Forma */}
        <div className="report-section">
          <h2 className="report-section-title">{deal.holdPeriodYears}-Year Pro Forma</h2>
          <table className="report-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Year</th>
                <th>Gross Income</th>
                <th>Vacancy</th>
                <th>Op. Expenses</th>
                <th>NOI</th>
                <th>Cash Flow</th>
              </tr>
            </thead>
            <tbody>
              {metrics.proForma.map(row => (
                <tr key={row.year}>
                  <td>{row.year}</td>
                  <td>{formatCurrency(row.grossPotentialIncome)}</td>
                  <td>({formatCurrency(row.vacancyLoss)})</td>
                  <td>({formatCurrency(row.operatingExpenses)})</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(row.noi)}</td>
                  <td>{formatCurrency(row.cashFlow)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Investor Waterfall */}
        <div className="report-section">
          <h2 className="report-section-title">Investor Waterfall</h2>
          <p className="report-prose">
            LP equity receives a <strong>{formatPercent(deal.preferredReturnRate)} preferred return</strong> on invested capital,
            with remaining profits split <strong>{formatPercent(1 - deal.sponsorPromoteRate)} LP / {formatPercent(deal.sponsorPromoteRate)} Sponsor (promote)</strong>.
          </p>
          <table className="report-table" style={{ marginTop: 16 }}>
            <tbody>
              <tr><td>LP Equity Invested</td><td>{formatCurrency(deal.equityInvested)}</td></tr>
              <tr><td>Total LP Distributions</td><td>{formatCurrency(w.totalLpDistributions)}</td></tr>
              <tr><td>LP Sale Proceeds</td><td>{formatCurrency(w.lpSaleProceeds)}</td></tr>
              <tr className="report-table-total"><td>Total LP Proceeds</td><td>{formatCurrency(w.totalLpDistributions + w.lpSaleProceeds)}</td></tr>
              <tr><td>Sponsor / GP Distributions</td><td>{formatCurrency(w.totalGpDistributions)}</td></tr>
              <tr><td>Sponsor Sale Proceeds</td><td>{formatCurrency(w.gpSaleProceeds)}</td></tr>
            </tbody>
          </table>
        </div>

        <div className="report-disclosure">
          <p>This document has been prepared by Rational Build Design for informational purposes only and does not constitute an offer to sell or a solicitation of an offer to buy any security. All projections are based on assumptions and estimates that may not be realized. Past performance is not indicative of future results. Prospective investors should conduct their own due diligence prior to making any investment decision.</p>
        </div>

        <div className="report-footer">
          <span>Rational Build Design · Investment Dashboard</span>
          <span>Confidential — Do Not Distribute</span>
        </div>
      </div>
    </div>
  )
}
