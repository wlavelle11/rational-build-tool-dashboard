import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/formatters'
import {
  ArrowLeft, Star, Home, MapPin, Calendar, Clock,
  DollarSign, TrendingUp, FileText, Radio, BarChart2,
  Building2, Hammer,
} from 'lucide-react'
import { SaveLeadButton } from '@/components/leads/SaveLeadButton'

export const dynamic = 'force-dynamic'

function ScoreBadge({ score }: { score: number }) {
  const cls = score >= 70 ? 'badge badge-success' : score >= 50 ? 'badge badge-warning' : 'badge badge-danger'
  return <span className={cls} style={{ fontSize: 14, padding: '4px 12px' }}><span className="badge-dot" />{score} / 100</span>
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

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <span style={{ color: 'var(--color-brand)' }}>{icon}</span>
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 20 }}>
        {children}
      </div>
    </div>
  )
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const lead = await prisma.lead.findUnique({ where: { id } })
  if (!lead) notFound()

  const daysInPipeline = lead.firstSeen
    ? Math.floor((Date.now() - new Date(lead.firstSeen).getTime()) / 86_400_000)
    : null

  const analyzeResidentialHref = `/residential/new?address=${encodeURIComponent(lead.address)}&name=${encodeURIComponent(lead.address)}&purchasePrice=${lead.estValue ?? ''}`
  const analyzeADUHref = `/adu/new?address=${encodeURIComponent(lead.address)}&name=${encodeURIComponent(lead.address)}`

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <Link href="/leads" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 8, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to Leads
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h1 className="page-title" style={{ marginBottom: 0 }}>{lead.address}</h1>
            {lead.priority && (
              <span className="badge badge-success">
                <Star size={10} style={{ marginRight: 3 }} />PRIORITY
              </span>
            )}
            <span className="badge badge-neutral">{lead.tab}</span>
          </div>
          {lead.zipCode && (
            <p className="page-description" style={{ marginTop: 4 }}>
              <MapPin size={13} style={{ display: 'inline', marginRight: 4 }} />
              {lead.zipCode}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
          <SaveLeadButton id={lead.id} initialSaved={lead.saved} />
          <Link href={analyzeADUHref} className="btn btn-outline">
            <Hammer size={14} />
            Analyze as ADU
          </Link>
          <Link href={analyzeResidentialHref} className="btn btn-primary">
            <Home size={14} />
            Analyze as Residential
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: lead.photoUrl ? '1fr 320px' : '1fr', gap: 20, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Score + quick stats */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Pipeline Score</p>
                <ScoreBadge score={lead.score} />
              </div>
              {lead.distressType && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Distress Type</p>
                  <span className="badge badge-neutral" style={{ fontSize: 13 }}>{lead.distressType}</span>
                </div>
              )}
              {lead.status && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Status</p>
                  <span className={`badge ${lead.priority ? 'badge-success' : lead.status.includes('Auction') ? 'badge-warning' : 'badge-neutral'}`} style={{ fontSize: 13 }}>
                    {lead.status}
                  </span>
                </div>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 20 }}>
              <Field label="Est. Value" value={lead.estValue ? formatCurrency(lead.estValue) : '—'} />
              <Field label="Loan Amount" value={lead.loanAmount ? formatCurrency(lead.loanAmount) : 'Unknown'} />
              <Field label="Est. Equity" value={lead.equity ? formatCurrency(lead.equity) : '—'} />
              <Field label="Equity %" value={lead.equityPct ? `${lead.equityPct.toFixed(0)}%` : '—'} />
            </div>
          </div>

          {/* Property details */}
          <Section title="Property Details" icon={<Home size={15} />}>
            <Field label="Bedrooms" value={lead.beds || '—'} />
            <Field label="Bathrooms" value={lead.baths || '—'} />
            <Field label="Sq Ft" value={lead.sqft || '—'} />
            <Field label="Year Built" value={lead.yearBuilt || '—'} />
            <Field label="Zip Code" value={lead.zipCode || '—'} />
            <Field label="Lead Type" value={lead.leadType || '—'} />
          </Section>

          {/* Timeline */}
          <Section title="Timeline" icon={<Calendar size={15} />}>
            <Field label="Filing Date" value={lead.filingDate || '—'} />
            <Field label="First Seen" value={lead.firstSeen || '—'} />
            <Field label="Last Seen" value={lead.lastSeen || '—'} />
            <Field label="Days in Pipeline" value={daysInPipeline !== null ? `${daysInPipeline} days` : '—'} />
          </Section>

          {/* Sources */}
          {lead.sources && (
            <Section title="Sources" icon={<Radio size={15} />}>
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {lead.sources.split(',').map(s => s.trim()).filter(Boolean).map(src => (
                    <span key={src} className="badge badge-neutral" style={{ fontSize: 12 }}>{src}</span>
                  ))}
                </div>
              </div>
            </Section>
          )}

          {/* Notes */}
          {lead.notes && (
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <span style={{ color: 'var(--color-brand)' }}><FileText size={15} /></span>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pipeline Notes</p>
              </div>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {lead.notes.split(' | ').join('\n')}
              </p>
            </div>
          )}
        </div>

        {/* Right column — photo + analyze CTAs */}
        {lead.photoUrl && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 24 }}>
            <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
              <Image
                src={lead.photoUrl}
                alt={lead.address}
                width={320}
                height={220}
                style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }}
                unoptimized
              />
              <div style={{ padding: '12px 16px' }}>
                <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>Property photo from listing source</p>
              </div>
            </div>

            <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Run Analysis</p>
              <Link href={analyzeResidentialHref} className="btn btn-primary" style={{ justifyContent: 'center' }}>
                <Home size={14} />
                Residential Flip / BRRR
              </Link>
              <Link href={analyzeADUHref} className="btn btn-outline" style={{ justifyContent: 'center' }}>
                <Hammer size={14} />
                ADU Development
              </Link>
            </div>
          </div>
        )}

        {/* No photo — show analyze card inline */}
        {!lead.photoUrl && (
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginRight: 8 }}>Run Analysis:</p>
              <Link href={analyzeResidentialHref} className="btn btn-primary">
                <Home size={14} />
                Residential Flip / BRRR
              </Link>
              <Link href={analyzeADUHref} className="btn btn-outline">
                <Hammer size={14} />
                ADU Development
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
