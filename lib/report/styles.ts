import { StyleSheet } from '@react-pdf/renderer'

export const COLORS = {
  navy: '#0f172a',
  blue: '#1e40af',
  lightBlue: '#3b82f6',
  lightBg: '#f8fafc',
  altRow: '#f1f5f9',
  muted: '#64748b',
  white: '#ffffff',
  border: '#e2e8f0',
  green: '#16a34a',
  amber: '#d97706',
  red: '#dc2626',
  text: '#1e293b',
}

export const styles = StyleSheet.create({
  // ── Page ─────────────────────────────────────────────────────────────────
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: COLORS.white,
    paddingTop: 0,
    paddingBottom: 40,
    paddingLeft: 0,
    paddingRight: 0,
    fontSize: 10,
    color: COLORS.text,
  },

  // ── Header bar ───────────────────────────────────────────────────────────
  headerBar: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: 40,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'column',
  },
  headerCompany: {
    color: COLORS.white,
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
  },
  headerTagline: {
    color: '#94a3b8',
    fontSize: 8,
    marginTop: 2,
    letterSpacing: 1.5,
  },
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  headerMemo: {
    color: COLORS.white,
    fontSize: 9,
    letterSpacing: 2,
    fontFamily: 'Helvetica',
  },
  confidentialBadge: {
    backgroundColor: COLORS.blue,
    color: COLORS.white,
    fontSize: 7,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
    letterSpacing: 1.5,
    marginTop: 5,
    alignSelf: 'flex-end',
  },

  // ── Title block ──────────────────────────────────────────────────────────
  titleBlock: {
    paddingHorizontal: 40,
    paddingTop: 24,
    paddingBottom: 16,
  },
  dealName: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.navy,
    lineHeight: 1.2,
  },
  dealAddress: {
    fontSize: 10,
    color: COLORS.muted,
    marginTop: 4,
  },
  dealNeighborhood: {
    fontSize: 10,
    color: COLORS.muted,
    marginTop: 1,
  },
  strategyTag: {
    fontSize: 9,
    color: COLORS.blue,
    fontFamily: 'Helvetica-Bold',
    marginTop: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // ── Horizontal rule ──────────────────────────────────────────────────────
  rule: {
    marginHorizontal: 40,
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },

  // ── Section labels ───────────────────────────────────────────────────────
  sectionContainer: {
    paddingHorizontal: 40,
    marginTop: 16,
  },
  sectionLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.blue,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  sectionParagraph: {
    fontSize: 9.5,
    color: COLORS.text,
    lineHeight: 1.55,
  },

  // ── KPI strip ────────────────────────────────────────────────────────────
  kpiStrip: {
    flexDirection: 'row',
    paddingHorizontal: 40,
    marginTop: 16,
    gap: 8,
  },
  kpiBox: {
    flex: 1,
    backgroundColor: COLORS.lightBg,
    borderTopWidth: 3,
    borderTopColor: COLORS.blue,
    borderTopStyle: 'solid',
    padding: 10,
    borderRadius: 4,
  },
  kpiValue: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.navy,
    lineHeight: 1,
  },
  kpiLabel: {
    fontSize: 7.5,
    color: COLORS.muted,
    marginTop: 4,
    letterSpacing: 0.3,
  },

  // ── Two-column layout for residential ───────────────────────────────────
  twoCol: {
    flexDirection: 'row',
    paddingHorizontal: 40,
    marginTop: 16,
    gap: 12,
  },
  colCard: {
    flex: 1,
    backgroundColor: COLORS.lightBg,
    borderRadius: 6,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'solid',
  },
  colCardTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.navy,
    letterSpacing: 0.5,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    borderBottomStyle: 'solid',
  },
  colMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  colMetricLabel: {
    fontSize: 8.5,
    color: COLORS.muted,
  },
  colMetricValue: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.navy,
  },

  // ── Table ────────────────────────────────────────────────────────────────
  tableContainer: {
    paddingHorizontal: 40,
    marginTop: 6,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  tableRowAlt: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: COLORS.altRow,
  },
  tableRowTotal: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: COLORS.navy,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: COLORS.navy,
    borderRadius: 3,
    marginBottom: 2,
  },
  tableCellLeft: {
    flex: 2,
    fontSize: 8.5,
    color: COLORS.text,
  },
  tableCellRight: {
    flex: 1,
    fontSize: 8.5,
    color: COLORS.text,
    textAlign: 'right',
  },
  tableCellLeftTotal: {
    flex: 2,
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
  },
  tableCellRightTotal: {
    flex: 1,
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    textAlign: 'right',
  },
  tableCellHeaderLeft: {
    flex: 2,
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  tableCellHeaderRight: {
    flex: 1,
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    textAlign: 'right',
    letterSpacing: 0.5,
  },

  // ── Pro forma table (multi-column) ───────────────────────────────────────
  proFormaHeader: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: COLORS.navy,
    borderRadius: 3,
    marginBottom: 2,
  },
  proFormaRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  proFormaRowAlt: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: COLORS.altRow,
  },
  proFormaCell: {
    flex: 1,
    fontSize: 8,
    color: COLORS.text,
    textAlign: 'right',
  },
  proFormaCellFirst: {
    flex: 0.6,
    fontSize: 8,
    color: COLORS.text,
  },
  proFormaCellBold: {
    flex: 1,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.navy,
    textAlign: 'right',
  },
  proFormaHeaderCell: {
    flex: 1,
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    textAlign: 'right',
    letterSpacing: 0.3,
  },
  proFormaHeaderCellFirst: {
    flex: 0.6,
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    letterSpacing: 0.3,
  },

  // ── Disclosure ───────────────────────────────────────────────────────────
  disclosure: {
    paddingHorizontal: 40,
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    borderTopStyle: 'solid',
  },
  disclosureText: {
    fontSize: 6.5,
    color: '#94a3b8',
    lineHeight: 1.5,
  },

  // ── Footer ───────────────────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 7.5,
    color: COLORS.muted,
  },

  // ── Feasibility color helpers (used inline) ──────────────────────────────
  flagPass: { color: COLORS.green, fontFamily: 'Helvetica-Bold' },
  flagCaution: { color: COLORS.amber, fontFamily: 'Helvetica-Bold' },
  flagFail: { color: COLORS.red, fontFamily: 'Helvetica-Bold' },
})
