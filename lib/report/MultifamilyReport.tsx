import React from 'react'
import { Document, Page, View, Text } from '@react-pdf/renderer'
import { styles, COLORS } from './styles'
import type { DealMetrics } from '@/lib/finance/types'
import { formatCurrency, formatPercent, formatMultiple } from '@/lib/formatters'

interface MultifamilyReportProps {
  name: string
  address?: string | null
  neighborhood: string
  units: number
  purchasePrice: number
  acquisitionClosingCosts: number
  renovationCapex: number
  equityInvested: number
  monthlyGrossRent: number
  vacancyRate: number
  operatingExpenseRatio: number
  holdPeriodYears: number
  exitCapRate: number
  preferredReturnRate: number
  sponsorPromoteRate: number
  metrics: DealMetrics
  date: string
}

export function MultifamilyReport(props: MultifamilyReportProps) {
  const {
    name, address, neighborhood, units,
    purchasePrice, acquisitionClosingCosts, renovationCapex, equityInvested,
    monthlyGrossRent, vacancyRate, operatingExpenseRatio,
    holdPeriodYears, exitCapRate, preferredReturnRate, sponsorPromoteRate,
    metrics, date,
  } = props

  const allInCost = purchasePrice + acquisitionClosingCosts + renovationCapex
  const w = metrics.waterfall
  const rec = metrics.recommendation
  const recColor = rec === 'Strong Buy' ? COLORS.green : rec === 'Caution' ? COLORS.amber : COLORS.red

  return (
    <Document
      title={`${name} — Multifamily Investor Report`}
      author="Rational Build Design"
      subject="Investment Memorandum"
    >
      {/* ─── PAGE 1 ─────────────────────────────────────────────────────── */}
      <Page size="A4" style={styles.page}>
        {/* Header bar */}
        <View style={styles.headerBar}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerCompany}>RATIONAL BUILD DESIGN</Text>
            <Text style={styles.headerTagline}>INVESTMENT DASHBOARD</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerMemo}>INVESTMENT MEMORANDUM</Text>
            <Text style={styles.confidentialBadge}>CONFIDENTIAL</Text>
          </View>
        </View>

        {/* Title block */}
        <View style={styles.titleBlock}>
          <Text style={styles.dealName}>{name}</Text>
          {address ? <Text style={styles.dealAddress}>{address}</Text> : null}
          <Text style={styles.dealNeighborhood}>{`${neighborhood} · ${units} Units`}</Text>
          <Text style={styles.strategyTag}>{`Multifamily Acquisition · ${holdPeriodYears}-Year Hold`}</Text>
        </View>

        <View style={styles.rule} />

        {/* Executive Summary */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>Executive Summary</Text>
          <Text style={styles.sectionParagraph}>
            {`Rational Build Design has identified ${name}, a ${units}-unit multifamily property in ${neighborhood}, as a compelling acquisition opportunity. `}
            {`The property is offered at ${formatCurrency(purchasePrice)} (${formatCurrency(purchasePrice / units)}/unit) with an all-in cost basis of ${formatCurrency(allInCost)}. `}
            {`The investment projects a ${formatPercent(metrics.irr)} IRR and ${formatMultiple(metrics.equityMultiple)} equity multiple over the ${holdPeriodYears}-year hold period, `}
            {`with a Year 1 cap rate of ${formatPercent(metrics.year1CapRate)} and cash-on-cash return of ${formatPercent(metrics.year1CashOnCash)}.`}
          </Text>
        </View>

        {/* KPI Strip */}
        <View style={styles.kpiStrip}>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiValue}>{formatPercent(metrics.irr)}</Text>
            <Text style={styles.kpiLabel}>IRR</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiValue}>{formatMultiple(metrics.equityMultiple)}</Text>
            <Text style={styles.kpiLabel}>Equity Multiple</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiValue}>{formatPercent(metrics.year1CapRate)}</Text>
            <Text style={styles.kpiLabel}>Year 1 Cap Rate</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiValue}>{formatPercent(metrics.year1CashOnCash)}</Text>
            <Text style={styles.kpiLabel}>Cash-on-Cash</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiValue}>{formatCurrency(metrics.exitValuation)}</Text>
            <Text style={styles.kpiLabel}>Exit Valuation</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={[styles.kpiValue, { color: recColor }]}>{rec}</Text>
            <Text style={styles.kpiLabel}>Rating</Text>
          </View>
        </View>

        <View style={styles.rule} />

        {/* Deal Economics Table */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>Deal Economics</Text>
        </View>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCellHeaderLeft}>Line Item</Text>
            <Text style={styles.tableCellHeaderRight}>Value</Text>
          </View>
          {[
            ['Purchase Price', formatCurrency(purchasePrice)],
            ['Price Per Unit', formatCurrency(purchasePrice / units)],
            ['Acquisition Closing Costs', formatCurrency(acquisitionClosingCosts)],
            ['Renovation / CapEx', formatCurrency(renovationCapex)],
          ].map(([label, value], i) => (
            <View key={label} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={styles.tableCellLeft}>{label}</Text>
              <Text style={styles.tableCellRight}>{value}</Text>
            </View>
          ))}
          <View style={styles.tableRowTotal}>
            <Text style={styles.tableCellLeftTotal}>All-In Cost Basis</Text>
            <Text style={styles.tableCellRightTotal}>{formatCurrency(allInCost)}</Text>
          </View>
          {[
            ['Equity Invested', formatCurrency(equityInvested)],
            ['Monthly Gross Rent', formatCurrency(monthlyGrossRent)],
            ['Annual Gross Rent', formatCurrency(monthlyGrossRent * 12)],
            ['Vacancy Rate', formatPercent(vacancyRate)],
            ['Operating Expense Ratio', formatPercent(operatingExpenseRatio)],
            ['Year 1 NOI', formatCurrency(metrics.year1NOI)],
            ['Exit Cap Rate', formatPercent(exitCapRate)],
            ['Exit Valuation', formatCurrency(metrics.exitValuation)],
            ['Total Value Creation', formatCurrency(metrics.totalValueCreation)],
          ].map(([label, value], i) => (
            <View key={label} style={(i + 1) % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={styles.tableCellLeft}>{label}</Text>
              <Text style={styles.tableCellRight}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Rational Build Design · Investment Dashboard</Text>
          <Text style={styles.footerText}>Prepared {date} · Page 1 of 2</Text>
        </View>
      </Page>

      {/* ─── PAGE 2 ─────────────────────────────────────────────────────── */}
      <Page size="A4" style={styles.page}>
        {/* Header bar */}
        <View style={styles.headerBar}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerCompany}>RATIONAL BUILD DESIGN</Text>
            <Text style={styles.headerTagline}>INVESTMENT DASHBOARD</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerMemo}>INVESTMENT MEMORANDUM</Text>
            <Text style={styles.confidentialBadge}>CONFIDENTIAL</Text>
          </View>
        </View>

        {/* Sub-header */}
        <View style={{ paddingHorizontal: 40, paddingTop: 14, paddingBottom: 8 }}>
          <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: COLORS.navy }}>{name}</Text>
          <Text style={{ fontSize: 8.5, color: COLORS.muted, marginTop: 2 }}>
            {`${units}-Unit Multifamily · Pro Forma & Investor Return Structure`}
          </Text>
        </View>

        <View style={styles.rule} />

        {/* PRO FORMA TABLE */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>{holdPeriodYears}-Year Pro Forma Projections</Text>
        </View>
        <View style={styles.tableContainer}>
          <View style={styles.proFormaHeader}>
            <Text style={styles.proFormaHeaderCellFirst}>Year</Text>
            <Text style={styles.proFormaHeaderCell}>Gross Income</Text>
            <Text style={styles.proFormaHeaderCell}>Vacancy</Text>
            <Text style={styles.proFormaHeaderCell}>Op. Expenses</Text>
            <Text style={styles.proFormaHeaderCell}>NOI</Text>
            <Text style={styles.proFormaHeaderCell}>Cash Flow</Text>
          </View>
          {metrics.proForma.map((row, i) => (
            <View key={row.year} style={i % 2 === 0 ? styles.proFormaRow : styles.proFormaRowAlt}>
              <Text style={styles.proFormaCellFirst}>{row.year}</Text>
              <Text style={styles.proFormaCell}>{formatCurrency(row.grossPotentialIncome)}</Text>
              <Text style={styles.proFormaCell}>({formatCurrency(row.vacancyLoss)})</Text>
              <Text style={styles.proFormaCell}>({formatCurrency(row.operatingExpenses)})</Text>
              <Text style={styles.proFormaCellBold}>{formatCurrency(row.noi)}</Text>
              <Text style={styles.proFormaCell}>{formatCurrency(row.cashFlow)}</Text>
            </View>
          ))}
        </View>

        {/* INVESTOR RETURN STRUCTURE */}
        <View style={[styles.sectionContainer, { marginTop: 18 }]}>
          <Text style={styles.sectionLabel}>Investor Return Structure</Text>
          <Text style={[styles.sectionParagraph, { marginBottom: 6 }]}>
            {`LP equity receives a ${formatPercent(preferredReturnRate)} preferred return on invested capital, with remaining profits split ${formatPercent(1 - sponsorPromoteRate)} LP / ${formatPercent(sponsorPromoteRate)} Sponsor (promote).`}
          </Text>
        </View>

        {/* WATERFALL SUMMARY */}
        <View style={[styles.sectionContainer, { marginTop: 0 }]}>
          <Text style={[styles.sectionLabel, { marginTop: 8 }]}>Waterfall Summary</Text>
        </View>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCellHeaderLeft}>Component</Text>
            <Text style={styles.tableCellHeaderRight}>Amount</Text>
          </View>
          {[
            ['LP Equity Invested', formatCurrency(equityInvested)],
            ['Total LP Operating Distributions', formatCurrency(w.totalLpDistributions)],
            ['LP Sale Proceeds', formatCurrency(w.lpSaleProceeds)],
          ].map(([label, value], i) => (
            <View key={label} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={styles.tableCellLeft}>{label}</Text>
              <Text style={styles.tableCellRight}>{value}</Text>
            </View>
          ))}
          <View style={styles.tableRowTotal}>
            <Text style={styles.tableCellLeftTotal}>Total LP Proceeds</Text>
            <Text style={styles.tableCellRightTotal}>{formatCurrency(w.totalLpDistributions + w.lpSaleProceeds)}</Text>
          </View>
          {[
            ['Sponsor / GP Operating Distributions', formatCurrency(w.totalGpDistributions)],
            ['Sponsor Sale Proceeds', formatCurrency(w.gpSaleProceeds)],
          ].map(([label, value], i) => (
            <View key={label} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={styles.tableCellLeft}>{label}</Text>
              <Text style={styles.tableCellRight}>{value}</Text>
            </View>
          ))}
          <View style={styles.tableRowTotal}>
            <Text style={styles.tableCellLeftTotal}>Total GP Proceeds</Text>
            <Text style={styles.tableCellRightTotal}>{formatCurrency(w.totalGpDistributions + w.gpSaleProceeds)}</Text>
          </View>
        </View>

        {/* Summary metrics row */}
        <View style={[styles.kpiStrip, { marginTop: 14 }]}>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiValue}>{formatPercent(metrics.irr)}</Text>
            <Text style={styles.kpiLabel}>Project IRR</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiValue}>{formatMultiple(metrics.equityMultiple)}</Text>
            <Text style={styles.kpiLabel}>Equity Multiple</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiValue}>{formatCurrency(metrics.totalValueCreation)}</Text>
            <Text style={styles.kpiLabel}>Total Value Creation</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiValue}>{formatCurrency(metrics.cumulativeCashFlow)}</Text>
            <Text style={styles.kpiLabel}>Cumulative Cash Flow</Text>
          </View>
        </View>

        {/* Disclosure */}
        <View style={styles.disclosure}>
          <Text style={styles.disclosureText}>
            This document has been prepared by Rational Build Design for informational purposes only and does not constitute an offer to sell or a solicitation of an offer to buy any security. All projections are based on assumptions and estimates that may not be realized. Past performance is not indicative of future results. Prospective investors should conduct their own due diligence prior to making any investment decision.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Rational Build Design · Confidential — Do Not Distribute</Text>
          <Text style={styles.footerText}>Prepared {date} · Page 2 of 2</Text>
        </View>
      </Page>
    </Document>
  )
}
