import React from 'react'
import { Document, Page, View, Text } from '@react-pdf/renderer'
import { styles, COLORS } from './styles'
import type { ADUMetrics } from '@/lib/finance/adu'
import type { FeasibilityResult } from '@/lib/finance/adu-feasibility'
import { formatCurrency, formatPercent, formatMultiple } from '@/lib/formatters'

interface ADUReportProps {
  name: string
  address?: string | null
  neighborhood?: string | null
  purchasePrice: number
  constructionCost: number
  aduCount: number
  marketRateUnits: number
  middleIncomeUnits: number
  marketRateRent: number
  middleIncomeRent: number
  holdPeriodYears: number
  exitCapRate: number
  equityInvested: number
  preferredReturnRate: number
  sponsorSplit: number
  analysis: ADUMetrics
  feasibility: FeasibilityResult
  date: string
}

export function ADUReport(props: ADUReportProps) {
  const {
    name, address, neighborhood,
    purchasePrice, constructionCost, aduCount,
    marketRateUnits, marketRateRent, middleIncomeUnits, middleIncomeRent,
    holdPeriodYears, exitCapRate, equityInvested, preferredReturnRate, sponsorSplit,
    analysis, feasibility, date,
  } = props

  const rec = analysis.recommendation
  const recColor = rec === 'Strong Buy' ? COLORS.green : rec === 'Caution' ? COLORS.amber : COLORS.red

  return (
    <Document
      title={`${name} — ADU Investor Report`}
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
          {neighborhood ? <Text style={styles.dealNeighborhood}>{neighborhood}</Text> : null}
          <Text style={styles.strategyTag}>{`Bonus ADU Development · ${aduCount}-Unit Program`}</Text>
        </View>

        <View style={styles.rule} />

        {/* Executive Summary */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>Executive Summary</Text>
          <Text style={styles.sectionParagraph}>
            {`Rational Build Design has identified ${name}${neighborhood ? ` in ${neighborhood}` : ''} as a ${aduCount}-unit Bonus ADU development opportunity under California's SB 9 / AB 2221 framework. `}
            {`The project has a feasibility score of ${feasibility.totalScore}/100 (${feasibility.flag}) and projects an unlevered IRR of ${formatPercent(analysis.irr)} over a ${holdPeriodYears}-year hold, `}
            {`with total project cost of ${formatCurrency(analysis.totalProjectCost)} and an exit value of ${formatCurrency(analysis.exitValue)} at a ${formatPercent(exitCapRate)} cap rate.`}
          </Text>
        </View>

        {/* KPI Strip */}
        <View style={styles.kpiStrip}>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiValue}>{formatPercent(analysis.irr)}</Text>
            <Text style={styles.kpiLabel}>Unlevered IRR</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiValue}>{formatMultiple(analysis.equityMultiple)}</Text>
            <Text style={styles.kpiLabel}>Equity Multiple</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiValue}>{formatCurrency(analysis.year1NOI)}</Text>
            <Text style={styles.kpiLabel}>Year 1 NOI</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiValue}>{formatCurrency(analysis.exitValue)}</Text>
            <Text style={styles.kpiLabel}>Exit Value</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiValue}>{feasibility.totalScore}/100</Text>
            <Text style={styles.kpiLabel}>Feasibility Score</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={[styles.kpiValue, { color: recColor }]}>{rec}</Text>
            <Text style={styles.kpiLabel}>Rating</Text>
          </View>
        </View>

        <View style={styles.rule} />

        {/* Project Overview */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>Project Overview</Text>
        </View>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCellHeaderLeft}>Line Item</Text>
            <Text style={styles.tableCellHeaderRight}>Value</Text>
          </View>
          {[
            ['Purchase Price', formatCurrency(purchasePrice)],
            ['Construction Cost', formatCurrency(constructionCost)],
            ['ADU Count', `${aduCount} units`],
            [`Market Rate Units (${marketRateUnits})`, `${formatCurrency(marketRateRent)}/mo each`],
            [`Middle Income Units (${middleIncomeUnits})`, `${formatCurrency(middleIncomeRent)}/mo each`],
            ['Year 1 Monthly Rent', formatCurrency(analysis.year1MonthlyRent)],
            ['Year 1 NOI', formatCurrency(analysis.year1NOI)],
            ['Hold Period', `${holdPeriodYears} years`],
            ['Exit Cap Rate', formatPercent(exitCapRate)],
          ].map(([label, value], i) => (
            <View key={label} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={styles.tableCellLeft}>{label}</Text>
              <Text style={styles.tableCellRight}>{value}</Text>
            </View>
          ))}
          <View style={styles.tableRowTotal}>
            <Text style={styles.tableCellLeftTotal}>Total Project Cost</Text>
            <Text style={styles.tableCellRightTotal}>{formatCurrency(analysis.totalProjectCost)}</Text>
          </View>
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
          <Text style={{ fontSize: 8.5, color: COLORS.muted, marginTop: 2 }}>Feasibility Assessment · Pro Forma · Investor Waterfall</Text>
        </View>

        <View style={styles.rule} />

        {/* FEASIBILITY TABLE with pass/caution/fail coloring */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>Feasibility Assessment</Text>
        </View>
        <View style={styles.tableContainer}>
          {/* Header row */}
          <View style={[styles.proFormaHeader]}>
            <Text style={[styles.proFormaHeaderCellFirst, { flex: 2 }]}>Category</Text>
            <Text style={styles.proFormaHeaderCell}>Score</Text>
            <Text style={styles.proFormaHeaderCell}>Result</Text>
          </View>
          {feasibility.categories.map((cat, i) => {
            const flagStyle = cat.flag === 'pass' ? styles.flagPass : cat.flag === 'caution' ? styles.flagCaution : styles.flagFail
            return (
              <View key={cat.label} style={i % 2 === 0 ? styles.proFormaRow : styles.proFormaRowAlt}>
                <Text style={[styles.proFormaCell, { flex: 2, textAlign: 'left', fontSize: 8.5, color: COLORS.text }]}>{cat.label}</Text>
                <Text style={styles.proFormaCell}>{`${cat.score} / ${cat.maxScore}`}</Text>
                <Text style={[styles.proFormaCell, flagStyle]}>{cat.flag.toUpperCase()}</Text>
              </View>
            )
          })}
          <View style={styles.tableRowTotal}>
            <Text style={[styles.tableCellLeftTotal, { flex: 2 }]}>Total Score</Text>
            <Text style={[styles.tableCellRightTotal, { flex: 0 }]}>{feasibility.totalScore} / 100</Text>
            <Text style={[styles.tableCellRightTotal, { flex: 1, textAlign: 'right' }]}>{feasibility.flag}</Text>
          </View>
        </View>

        {/* PRO FORMA */}
        <View style={[styles.sectionContainer, { marginTop: 16 }]}>
          <Text style={styles.sectionLabel}>{holdPeriodYears}-Year Pro Forma Projections</Text>
        </View>
        <View style={styles.tableContainer}>
          <View style={styles.proFormaHeader}>
            <Text style={styles.proFormaHeaderCellFirst}>Year</Text>
            <Text style={styles.proFormaHeaderCell}>Gross Rent</Text>
            <Text style={styles.proFormaHeaderCell}>Vacancy</Text>
            <Text style={styles.proFormaHeaderCell}>Op. Exp</Text>
            <Text style={styles.proFormaHeaderCell}>NOI</Text>
            <Text style={styles.proFormaHeaderCell}>Cum. CF</Text>
          </View>
          {analysis.proForma.map((row, i) => (
            <View key={row.year} style={i % 2 === 0 ? styles.proFormaRow : styles.proFormaRowAlt}>
              <Text style={styles.proFormaCellFirst}>{row.year}</Text>
              <Text style={styles.proFormaCell}>{formatCurrency(row.grossRent)}</Text>
              <Text style={styles.proFormaCell}>({formatCurrency(row.vacancyLoss)})</Text>
              <Text style={styles.proFormaCell}>({formatCurrency(row.opEx)})</Text>
              <Text style={styles.proFormaCellBold}>{formatCurrency(row.noi)}</Text>
              <Text style={styles.proFormaCell}>{formatCurrency(row.cumulativeCashFlow)}</Text>
            </View>
          ))}
        </View>

        {/* INVESTOR WATERFALL */}
        <View style={[styles.sectionContainer, { marginTop: 16 }]}>
          <Text style={styles.sectionLabel}>Investor Waterfall Summary</Text>
          <Text style={[styles.sectionParagraph, { marginBottom: 6 }]}>
            {`LP equity receives a ${formatPercent(preferredReturnRate)} compound preferred return on invested capital, followed by return of capital, with remaining profits split ${formatPercent(1 - sponsorSplit)} LP / ${formatPercent(sponsorSplit)} Sponsor.`}
          </Text>
        </View>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCellHeaderLeft}>Component</Text>
            <Text style={styles.tableCellHeaderRight}>Amount</Text>
          </View>
          {[
            ['LP Equity Invested', formatCurrency(equityInvested)],
            ['LP Preferred Return Paid', formatCurrency(analysis.lpPreferredPaid)],
            ['LP Capital Returned', formatCurrency(analysis.lpCapitalReturned)],
            ['LP Profit Share', formatCurrency(analysis.investorProfit)],
          ].map(([label, value], i) => (
            <View key={label} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={styles.tableCellLeft}>{label}</Text>
              <Text style={styles.tableCellRight}>{value}</Text>
            </View>
          ))}
          <View style={styles.tableRowTotal}>
            <Text style={styles.tableCellLeftTotal}>Total LP Proceeds</Text>
            <Text style={styles.tableCellRightTotal}>
              {formatCurrency(analysis.lpPreferredPaid + analysis.lpCapitalReturned + analysis.investorProfit)}
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellLeft}>Sponsor Profit</Text>
            <Text style={styles.tableCellRight}>{formatCurrency(analysis.sponsorProfit)}</Text>
          </View>
        </View>

        {/* Disclosure */}
        <View style={styles.disclosure}>
          <Text style={styles.disclosureText}>
            This document has been prepared by Rational Build Design for informational purposes only and does not constitute an offer to sell or a solicitation of an offer to buy any security. All projections are based on assumptions that may not be realized. Prospective investors should conduct their own due diligence prior to making any investment decision.
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
