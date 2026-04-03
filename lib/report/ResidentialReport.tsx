import React from 'react'
import { Document, Page, View, Text } from '@react-pdf/renderer'
import { styles, COLORS } from './styles'
import type { FlipMetrics } from '@/lib/finance/flip'
import type { BRRRMetrics } from '@/lib/finance/brrr'
import { formatCurrency, formatPercent } from '@/lib/formatters'

interface ResidentialReportProps {
  name: string
  address?: string | null
  neighborhood?: string | null
  purchasePrice: number
  renovationBudget: number
  arv: number
  buyClosingCosts: number
  flipHoldMonths: number
  flipInvestorCapital: number
  brrrHoldYears: number
  brrrInvestorCapital: number
  flip: FlipMetrics
  brrr: BRRRMetrics
  date: string
}

export function ResidentialReport(props: ResidentialReportProps) {
  const {
    name, address, neighborhood,
    purchasePrice, renovationBudget, arv, buyClosingCosts,
    flipHoldMonths, flipInvestorCapital,
    brrrHoldYears, brrrInvestorCapital,
    flip, brrr, date,
  } = props

  const allInCost = purchasePrice + renovationBudget + buyClosingCosts
  const valueCreation = arv - allInCost

  return (
    <Document
      title={`${name} — Investor Report`}
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
          <Text style={styles.strategyTag}>Residential Flip / BRRR Analysis</Text>
        </View>

        <View style={styles.rule} />

        {/* Executive Summary */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>Executive Summary</Text>
          <Text style={styles.sectionParagraph}>
            {`Rational Build Design has identified ${name} as a compelling residential investment opportunity${neighborhood ? ` in ${neighborhood}` : ''}. `}
            {`The property is being acquired at ${formatCurrency(purchasePrice)} with an estimated after-repair value of ${formatCurrency(arv)} following a ${formatCurrency(renovationBudget)} renovation program. `}
            {`Two exit strategies are modeled: a ${flipHoldMonths}-month fix-and-flip targeting ${formatPercent(flip.annualizedRoi)} annualized ROI, and a BRRR hold strategy delivering ${formatPercent(brrr.actualCashYield)} cash yield over ${brrrHoldYears} years.`}
          </Text>
        </View>

        {/* KPI Strip */}
        <View style={styles.kpiStrip}>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiValue}>{formatCurrency(arv)}</Text>
            <Text style={styles.kpiLabel}>After-Repair Value</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiValue}>{formatCurrency(allInCost)}</Text>
            <Text style={styles.kpiLabel}>All-In Cost</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiValue}>{formatCurrency(valueCreation)}</Text>
            <Text style={styles.kpiLabel}>Value Creation</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={[styles.kpiValue, { color: flip.recommendation === 'Strong Buy' ? COLORS.green : flip.recommendation === 'Caution' ? COLORS.amber : COLORS.red }]}>
              {flip.recommendation}
            </Text>
            <Text style={styles.kpiLabel}>Flip Rating</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={[styles.kpiValue, { color: brrr.recommendation === 'Strong Buy' ? COLORS.green : brrr.recommendation === 'Caution' ? COLORS.amber : COLORS.red }]}>
              {brrr.recommendation}
            </Text>
            <Text style={styles.kpiLabel}>BRRR Rating</Text>
          </View>
        </View>

        <View style={styles.rule} />

        {/* Side-by-side strategy cards */}
        <View style={styles.twoCol}>
          {/* Flip */}
          <View style={styles.colCard}>
            <Text style={styles.colCardTitle}>FLIP STRATEGY — {flipHoldMonths}-Month Hold</Text>
            <View style={styles.colMetricRow}>
              <Text style={styles.colMetricLabel}>Investor Capital</Text>
              <Text style={styles.colMetricValue}>{formatCurrency(flipInvestorCapital)}</Text>
            </View>
            <View style={styles.colMetricRow}>
              <Text style={styles.colMetricLabel}>Gross Profit</Text>
              <Text style={styles.colMetricValue}>{formatCurrency(flip.grossProfit)}</Text>
            </View>
            <View style={styles.colMetricRow}>
              <Text style={styles.colMetricLabel}>Total Investor Return</Text>
              <Text style={[styles.colMetricValue, { color: COLORS.blue }]}>{formatCurrency(flip.totalInvestorReturn)}</Text>
            </View>
            <View style={styles.colMetricRow}>
              <Text style={styles.colMetricLabel}>Simple ROI</Text>
              <Text style={styles.colMetricValue}>{formatPercent(flip.roi)}</Text>
            </View>
            <View style={styles.colMetricRow}>
              <Text style={styles.colMetricLabel}>Annualized ROI</Text>
              <Text style={[styles.colMetricValue, { color: COLORS.blue }]}>{formatPercent(flip.annualizedRoi)}</Text>
            </View>
            <View style={styles.colMetricRow}>
              <Text style={styles.colMetricLabel}>Profit Margin</Text>
              <Text style={styles.colMetricValue}>{formatPercent(flip.profitMargin)}</Text>
            </View>
          </View>

          {/* BRRR */}
          <View style={styles.colCard}>
            <Text style={styles.colCardTitle}>BRRR STRATEGY — {brrrHoldYears}-Year Hold</Text>
            <View style={styles.colMetricRow}>
              <Text style={styles.colMetricLabel}>Investor Capital</Text>
              <Text style={styles.colMetricValue}>{formatCurrency(brrrInvestorCapital)}</Text>
            </View>
            <View style={styles.colMetricRow}>
              <Text style={styles.colMetricLabel}>Capital Returned (Refi)</Text>
              <Text style={styles.colMetricValue}>{formatCurrency(brrr.capitalReturnedViaRefi)}</Text>
            </View>
            <View style={styles.colMetricRow}>
              <Text style={styles.colMetricLabel}>Monthly Distribution</Text>
              <Text style={[styles.colMetricValue, { color: COLORS.blue }]}>{formatCurrency(brrr.monthlyInvestorDistribution)}</Text>
            </View>
            <View style={styles.colMetricRow}>
              <Text style={styles.colMetricLabel}>Cash Yield</Text>
              <Text style={[styles.colMetricValue, { color: COLORS.blue }]}>{formatPercent(brrr.actualCashYield)}</Text>
            </View>
            <View style={styles.colMetricRow}>
              <Text style={styles.colMetricLabel}>Total Distributions</Text>
              <Text style={styles.colMetricValue}>{formatCurrency(brrr.totalDistributions)}</Text>
            </View>
            <View style={styles.colMetricRow}>
              <Text style={styles.colMetricLabel}>Total ROI</Text>
              <Text style={styles.colMetricValue}>{formatPercent(brrr.totalROI)}</Text>
            </View>
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

        {/* Deal name sub-header */}
        <View style={{ paddingHorizontal: 40, paddingTop: 14, paddingBottom: 8 }}>
          <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: COLORS.navy }}>{name}</Text>
          <Text style={{ fontSize: 8.5, color: COLORS.muted, marginTop: 2 }}>Residential Flip / BRRR Analysis — Deal Economics</Text>
        </View>

        <View style={styles.rule} />

        {/* DEAL ECONOMICS TABLE */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>Deal Economics</Text>
        </View>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCellHeaderLeft}>Line Item</Text>
            <Text style={styles.tableCellHeaderRight}>Amount</Text>
          </View>
          {[
            ['Purchase Price', formatCurrency(purchasePrice)],
            ['Renovation Budget', formatCurrency(renovationBudget)],
            ['Acquisition Closing Costs', formatCurrency(buyClosingCosts)],
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
            ['After-Repair Value (ARV)', formatCurrency(arv)],
            ['Value Creation (ARV − All-In)', formatCurrency(valueCreation)],
          ].map(([label, value], i) => (
            <View key={label} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={styles.tableCellLeft}>{label}</Text>
              <Text style={styles.tableCellRight}>{value}</Text>
            </View>
          ))}
        </View>

        {/* INVESTOR RETURN STRUCTURE — FLIP */}
        <View style={[styles.sectionContainer, { marginTop: 18 }]}>
          <Text style={styles.sectionLabel}>Investor Return Structure — Flip</Text>
          <Text style={[styles.sectionParagraph, { marginBottom: 6 }]}>
            {`Investor capital is structured as a secured loan with a 1% origination fee, 10% annualized interest, and a 33.3% share of net project profits above basis.`}
          </Text>
        </View>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCellHeaderLeft}>Component</Text>
            <Text style={styles.tableCellHeaderRight}>Amount</Text>
          </View>
          {[
            [`Origination Fee (1%)`, formatCurrency(flip.loanFee)],
            [`Interest (10% annualized × ${flipHoldMonths} months)`, formatCurrency(flip.interest)],
            [`Profit Share (33.3% of net profit)`, formatCurrency(flip.investorProfitShare)],
          ].map(([label, value], i) => (
            <View key={label} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={styles.tableCellLeft}>{label}</Text>
              <Text style={styles.tableCellRight}>{value}</Text>
            </View>
          ))}
          <View style={styles.tableRowTotal}>
            <Text style={styles.tableCellLeftTotal}>Total Investor Return</Text>
            <Text style={styles.tableCellRightTotal}>{formatCurrency(flip.totalInvestorReturn)}</Text>
          </View>
          {[
            ['Simple ROI', formatPercent(flip.roi)],
            ['Annualized ROI', formatPercent(flip.annualizedRoi)],
          ].map(([label, value], i) => (
            <View key={label} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={styles.tableCellLeft}>{label}</Text>
              <Text style={styles.tableCellRight}>{value}</Text>
            </View>
          ))}
        </View>

        {/* BRRR CASH FLOW DETAILS */}
        <View style={[styles.sectionContainer, { marginTop: 18 }]}>
          <Text style={styles.sectionLabel}>BRRR Cash Flow Details</Text>
        </View>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCellHeaderLeft}>Component</Text>
            <Text style={styles.tableCellHeaderRight}>Amount</Text>
          </View>
          {[
            ['Refinance Loan Amount', formatCurrency(brrr.refinanceLoanAmount)],
            ['Capital Returned via Refinance', formatCurrency(brrr.capitalReturnedViaRefi)],
            ['Monthly Gross Rent', formatCurrency(brrr.monthlyGrossRent)],
            ['Monthly Operating Expenses', formatCurrency(brrr.monthlyOperatingExpenses)],
            ['Monthly Reserve', formatCurrency(brrr.monthlyReserve)],
            ['Monthly Mortgage Payment', formatCurrency(brrr.monthlyMortgage)],
            ['Monthly Net Cash Flow', formatCurrency(brrr.monthlyNetCashFlow)],
            ['Monthly Investor Distribution', formatCurrency(brrr.monthlyInvestorDistribution)],
            ['Annual Cash Yield', formatPercent(brrr.actualCashYield)],
          ].map(([label, value], i) => (
            <View key={label} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={styles.tableCellLeft}>{label}</Text>
              <Text style={styles.tableCellRight}>{value}</Text>
            </View>
          ))}
          <View style={styles.tableRowTotal}>
            <Text style={styles.tableCellLeftTotal}>Total ROI ({brrrHoldYears}-Year Hold)</Text>
            <Text style={styles.tableCellRightTotal}>{formatPercent(brrr.totalROI)}</Text>
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
