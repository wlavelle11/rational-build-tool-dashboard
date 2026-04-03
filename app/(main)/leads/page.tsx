import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/formatters'
import { Target, Star, TrendingUp, AlertCircle, Home, Bookmark } from 'lucide-react'
import { StatCard } from '@/components/ui/stat-card'
import { GenerateLeadsButton } from '@/components/leads/GenerateLeadsButton'

export const dynamic = 'force-dynamic'

const TABS = ['NOD', 'Auction', 'Listed', 'Archived', 'Saved'] as const
type Tab = typeof TABS[number]

function ScoreBadge({ score }: { score: number }) {
  const cls = score >= 70 ? 'badge badge-success' : score >= 50 ? 'badge badge-warning' : 'badge badge-danger'
  return <span className={cls}><span className="badge-dot" />{score}</span>
}

function PriorityBadge() {
  return (
    <span className="badge badge-success" style={{ fontSize: 10 }}>
      <Star size={9} style={{ marginRight: 2 }} />
      PRIORITY
    </span>
  )
}

function PropertyPhoto({ url, address }: { url: string | null; address: string }) {
  if (url) {
    return (
      <div style={{ width: 72, height: 54, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: 'var(--color-surface-raised)' }}>
        <Image
          src={url}
          alt={address}
          width={72}
          height={54}
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          unoptimized
        />
      </div>
    )
  }
  return (
    <div style={{
      width: 72, height: 54, borderRadius: 6, flexShrink: 0,
      background: 'var(--color-surface-raised)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--color-text-tertiary)',
    }}>
      <Home size={20} />
    </div>
  )
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const activeTab: Tab = TABS.includes(params.tab as Tab) ? (params.tab as Tab) : 'NOD'

  const [allLeads, tabLeads] = await Promise.all([
    prisma.lead.findMany({ select: { tab: true, score: true, priority: true, saved: true } }),
    prisma.lead.findMany({
      where: activeTab === 'Saved' ? { saved: true } : { tab: activeTab },
      orderBy: { score: 'desc' },
    }),
  ])

  const totalLeads    = allLeads.length
  const priorityCount = allLeads.filter(l => l.priority).length
  const highScore     = allLeads.filter(l => l.score >= 70).length
  const avgScore      = totalLeads > 0
    ? Math.round(allLeads.reduce((s, l) => s + l.score, 0) / totalLeads)
    : 0

  const savedCount = allLeads.filter(l => l.saved).length
  const tabCounts = TABS.reduce<Record<string, number>>((acc, t) => {
    acc[t] = t === 'Saved' ? savedCount : allLeads.filter(l => l.tab === t).length
    return acc
  }, {})

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <p className="page-eyebrow">Pipeline</p>
          <h1 className="page-title">Property Leads</h1>
          <p className="page-description">Scored leads from the Rational Build pipeline — NOD, auction, and listed properties</p>
        </div>
        <GenerateLeadsButton />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Total Leads" value={String(totalLeads)} sub="Across all sources" icon={<Target size={16} />} />
        <StatCard
          label="High Score (≥70)"
          value={String(highScore)}
          sub="Above alert threshold"
          trend={highScore > 0 ? 'positive' : 'neutral'}
          icon={<TrendingUp size={16} />}
        />
        <StatCard
          label="Priority Leads"
          value={String(priorityCount)}
          sub="Individual owner"
          trend={priorityCount > 0 ? 'positive' : 'neutral'}
          icon={<Star size={16} />}
        />
        <StatCard
          label="Avg Score"
          value={String(avgScore)}
          sub="Out of 100"
          trend={avgScore >= 60 ? 'positive' : avgScore >= 40 ? 'warning' : 'negative'}
          icon={<AlertCircle size={16} />}
        />
        <StatCard
          label="Saved"
          value={String(savedCount)}
          sub="Preserved from cleanup"
          trend={savedCount > 0 ? 'positive' : 'neutral'}
          icon={<Bookmark size={16} />}
        />
      </div>

      {/* Tab filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {TABS.map(t => (
          <Link
            key={t}
            href={`/leads?tab=${t}`}
            className={activeTab === t ? 'btn btn-primary' : 'btn btn-outline'}
            style={{ height: 32, fontSize: 12, padding: '0 14px' }}
          >
            {t}
            <span style={{
              marginLeft: 6,
              background: activeTab === t ? 'rgba(255,255,255,0.2)' : 'var(--color-surface-raised)',
              color: activeTab === t ? 'inherit' : 'var(--color-text-secondary)',
              borderRadius: 10,
              padding: '1px 7px',
              fontSize: 11,
              fontWeight: 600,
            }}>
              {tabCounts[t] ?? 0}
            </span>
          </Link>
        ))}
      </div>

      {tabLeads.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><Target size={24} /></div>
            <p className="empty-state-title">No {activeTab} leads yet</p>
            <p className="empty-state-desc">
              Click <strong>Generate Leads</strong> to run the pipeline and pull the latest scored properties from all sources.
            </p>
          </div>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <div className="data-table-header">
            <div>
              <p className="card-title">{activeTab} Leads</p>
              <p className="card-subtitle">{tabLeads.length} propert{tabLeads.length !== 1 ? 'ies' : 'y'} — sorted by score</p>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 80 }}>Photo</th>
                  <th>Score</th>
                  <th>Address</th>
                  <th>Type</th>
                  <th>Est. Value</th>
                  <th>Equity</th>
                  <th>Bed / Bath / Sqft</th>
                  <th>Filing Date</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {tabLeads.map(lead => (
                  <tr key={lead.id}>
                    <td>
                      <PropertyPhoto url={lead.photoUrl ?? null} address={lead.address} />
                    </td>
                    <td><ScoreBadge score={lead.score} /></td>
                    <td>
                      <Link href={`/leads/${lead.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="deal-row-name truncate-line" style={{ maxWidth: 200 }}>{lead.address}</div>
                      </Link>
                      <div style={{ display: 'flex', gap: 4, marginTop: 3, flexWrap: 'wrap' }}>
                        {lead.priority && <PriorityBadge />}
                        {lead.saved && (
                          <span className="badge badge-neutral" style={{ fontSize: 10 }}>
                            <Bookmark size={9} style={{ marginRight: 2 }} />SAVED
                          </span>
                        )}
                      </div>
                      {lead.zipCode && <div className="table-cell-muted" style={{ marginTop: 2 }}>{lead.zipCode}</div>}
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ fontSize: 11 }}>
                        {lead.distressType || lead.leadType || '—'}
                      </span>
                    </td>
                    <td className="num">
                      {lead.estValue ? formatCurrency(lead.estValue) : '—'}
                    </td>
                    <td className="num table-cell-primary">
                      {lead.equity ? formatCurrency(lead.equity) : '—'}
                      {lead.equityPct ? (
                        <div className="table-cell-muted" style={{ fontSize: 11 }}>
                          {lead.equityPct.toFixed(0)}%
                        </div>
                      ) : null}
                    </td>
                    <td className="num table-cell-muted">
                      {[lead.beds, lead.baths, lead.sqft].filter(Boolean).join(' / ') || '—'}
                    </td>
                    <td className="num table-cell-muted">{lead.filingDate || '—'}</td>
                    <td>
                      {lead.status
                        ? <span className="badge badge-neutral" style={{ fontSize: 11 }}>{lead.status}</span>
                        : '—'}
                    </td>
                    <td>
                      <Link
                        href={`/leads/${lead.id}`}
                        className="btn btn-outline"
                        style={{ height: 28, fontSize: 12, padding: '0 12px', whiteSpace: 'nowrap' }}
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
