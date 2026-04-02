'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { assessFeasibility } from '@/lib/finance/adu-feasibility'
import { analyzeADU } from '@/lib/finance/adu'
import type { FeasibilityResult } from '@/lib/finance/adu-feasibility'
import type { ADUMetrics } from '@/lib/finance/adu'
import { FeasibilityScoreCard } from './FeasibilityScoreCard'
import { ADUMetricsPanel } from './ADUMetrics'
import { ADUProForma } from './ADUProForma'
import { Save, RefreshCw, Sparkles, Loader2 } from 'lucide-react'

interface FormValues {
  name: string
  neighborhood: string
  address: string
  apn: string
  purchasePrice: number
  // Feasibility
  lotSizeSqft: number
  existingCoverageSqft: number
  zoningCode: string
  setbackFront: boolean
  setbackRear: boolean
  setbackSide: boolean
  utilityWater: 'adequate' | 'needs_upgrade'
  utilitySewer: 'adequate' | 'needs_upgrade'
  hasHOA: boolean
  permitTimelineMonths: number
  permitCostEstimate: number
  // Analysis
  aduCount: number
  constructionCost: number
  marketRateUnits: number
  middleIncomeUnits: number
  marketRateRent: number
  middleIncomeRent: number
  vacancyRate: number
  opExpRatio: number
  annualRentGrowth: number
  holdPeriodYears: number
  exitCapRate: number
  equityInvested: number
  preferredReturnRate: number
  sponsorSplit: number
}

const DEFAULTS: FormValues = {
  name: '', neighborhood: '', address: '', apn: '',
  purchasePrice: 1200000,
  lotSizeSqft: 0, existingCoverageSqft: 0, zoningCode: '',
  setbackFront: false, setbackRear: false, setbackSide: false,
  utilityWater: 'adequate', utilitySewer: 'adequate',
  hasHOA: false, permitTimelineMonths: 6, permitCostEstimate: 15000,
  aduCount: 4, constructionCost: 600000,
  marketRateUnits: 2, middleIncomeUnits: 2,
  marketRateRent: 2400, middleIncomeRent: 1900,
  vacancyRate: 0.05, opExpRatio: 0.30, annualRentGrowth: 0.055,
  holdPeriodYears: 10, exitCapRate: 0.05,
  equityInvested: 1800000, preferredReturnRate: 0.06, sponsorSplit: 0.70,
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="form-field">
      <label className="form-label">{label}</label>
      {children}
      {hint && !error && <p className="form-hint">{hint}</p>}
      {error && <p className="form-error">{error}</p>}
    </div>
  )
}

function FInput({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className="input" {...props} />
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="form-section">
      <div className="form-section-header"><p className="form-section-title">{title}</p></div>
      <div className="form-section-body">{children}</div>
    </div>
  )
}

function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--color-text-primary)' }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ width: 15, height: 15, cursor: 'pointer' }} />
      {label}
    </label>
  )
}

function UtilityToggle({ label, value, onChange }: { label: string; value: string; onChange: (v: 'adequate' | 'needs_upgrade') => void }) {
  return (
    <div className="form-field">
      <label className="form-label">{label}</label>
      <div style={{ display: 'flex', gap: 4, background: 'var(--color-surface-raised)', padding: 3, borderRadius: 8, width: 'fit-content' }}>
        {(['adequate', 'needs_upgrade'] as const).map((opt) => (
          <button key={opt} type="button" onClick={() => onChange(opt)} style={{
            padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
            background: value === opt ? (opt === 'adequate' ? 'var(--color-success)' : 'var(--color-warning)') : 'transparent',
            color: value === opt ? '#fff' : 'var(--color-text-secondary)',
            transition: 'all 0.15s',
          }}>
            {opt === 'adequate' ? 'Adequate' : 'Needs Upgrade'}
          </button>
        ))}
      </div>
    </div>
  )
}

export function ADUForm({ projectId }: { projectId?: string }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'feasibility' | 'analysis'>('feasibility')
  const [saving, setSaving] = useState(false)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupError, setLookupError] = useState<string | null>(null)

  const { register, handleSubmit, watch, setValue, getValues } = useForm<FormValues>({ defaultValues: DEFAULTS })
  const values = watch()

  const feasibility: FeasibilityResult = (() => {
    try {
      return assessFeasibility({
        lotSizeSqft: Number(values.lotSizeSqft) || 0,
        existingCoverageSqft: Number(values.existingCoverageSqft) || 0,
        zoningCode: values.zoningCode || '',
        aduCount: Number(values.aduCount) || 4,
        setbackFront: Boolean(values.setbackFront),
        setbackRear: Boolean(values.setbackRear),
        setbackSide: Boolean(values.setbackSide),
        utilityWater: values.utilityWater || 'adequate',
        utilitySewer: values.utilitySewer || 'adequate',
        hasHOA: Boolean(values.hasHOA),
        permitTimelineMonths: Number(values.permitTimelineMonths) || 6,
        permitCostEstimate: Number(values.permitCostEstimate) || 0,
      })
    } catch { return { totalScore: 0, flag: 'NO-GO' as const, categories: [] } }
  })()

  const analysis: ADUMetrics = (() => {
    try {
      return analyzeADU({
        purchasePrice: Number(values.purchasePrice) || 0,
        constructionCost: Number(values.constructionCost) || 0,
        aduCount: Number(values.aduCount) || 4,
        marketRateUnits: Number(values.marketRateUnits) || 2,
        middleIncomeUnits: Number(values.middleIncomeUnits) || 2,
        marketRateRent: Number(values.marketRateRent) || 0,
        middleIncomeRent: Number(values.middleIncomeRent) || 0,
        vacancyRate: Number(values.vacancyRate) || 0.05,
        opExpRatio: Number(values.opExpRatio) || 0.30,
        annualRentGrowth: Number(values.annualRentGrowth) || 0.055,
        holdPeriodYears: Number(values.holdPeriodYears) || 10,
        exitCapRate: Number(values.exitCapRate) || 0.05,
        equityInvested: Number(values.equityInvested) || 0,
        preferredReturnRate: Number(values.preferredReturnRate) || 0.06,
        sponsorSplit: Number(values.sponsorSplit) || 0.70,
      })
    } catch { return null as unknown as ADUMetrics }
  })()

  const handleAutoFill = useCallback(async () => {
    const address = getValues('address')
    if (!address.trim()) { setLookupError('Enter a property address first.'); return }
    setLookupLoading(true)
    setLookupError(null)
    try {
      const res = await fetch(`/api/adu/lookup?address=${encodeURIComponent(address)}`)
      const data = await res.json()
      if (!res.ok) { setLookupError(data.error ?? 'Lookup failed. Enter values manually.'); return }
      if (data.apn) setValue('apn', data.apn)
      if (data.lotSizeSqft) setValue('lotSizeSqft', data.lotSizeSqft)
      if (data.zoningCode) setValue('zoningCode', data.zoningCode)
      if (data.existingCoverageSqft) setValue('existingCoverageSqft', data.existingCoverageSqft)
      setLookupError(null)
    } catch {
      setLookupError('Lookup failed. Enter values manually.')
    } finally {
      setLookupLoading(false)
    }
  }, [getValues, setValue])

  const onSubmit = async (data: FormValues) => {
    setSaving(true)
    try {
      const url = projectId ? `/api/adu/${projectId}` : '/api/adu'
      const method = projectId ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (!res.ok) throw new Error('Save failed')
      router.push('/adu')
      router.refresh()
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const tabStyle = (tab: 'feasibility' | 'analysis') => ({
    padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
    background: activeTab === tab ? 'var(--color-brand)' : 'transparent',
    color: activeTab === tab ? '#fff' : 'var(--color-text-secondary)',
    transition: 'all 0.15s',
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Shared property info */}
      <div className="card" style={{ padding: 24 }}>
        <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>Property Information</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Project Name"><FInput {...register('name')} placeholder="e.g. Oak St ADU Development" /></Field>
          <Field label="Neighborhood"><FInput {...register('neighborhood')} placeholder="e.g. Clairemont" /></Field>
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <Field label="Property Address" hint="Enter full address then click Auto-Fill">
              <FInput {...register('address')} placeholder="1234 Oak St, San Diego, CA 92117" style={{ minWidth: 300 }} />
            </Field>
            <button type="button" onClick={handleAutoFill} disabled={lookupLoading}
              className="btn btn-outline" style={{ flexShrink: 0, marginBottom: lookupError ? 20 : 0 }}>
              {lookupLoading ? <Loader2 size={14} className="spinning" /> : <Sparkles size={14} />}
              Auto-Fill from County Data
            </button>
          </div>
          {lookupError && <p className="form-error" style={{ gridColumn: '1 / -1', marginTop: -8 }}>{lookupError}</p>}
          <Field label="APN (Parcel Number)" hint="Auto-filled or enter manually">
            <FInput {...register('apn')} placeholder="e.g. 123-456-78" />
          </Field>
          <Field label="Purchase Price ($)">
            <FInput {...register('purchasePrice')} type="number" min="0" />
          </Field>
        </div>
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--color-surface-raised)', padding: 4, borderRadius: 10, width: 'fit-content' }}>
        <button type="button" style={tabStyle('feasibility')} onClick={() => setActiveTab('feasibility')}>
          Feasibility
          <span style={{
            marginLeft: 6, fontSize: 10, padding: '2px 6px', borderRadius: 10,
            background: feasibility.flag === 'GO' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.2)',
          }}>
            {feasibility.totalScore}/100 · {feasibility.flag}
          </span>
        </button>
        <button type="button" style={tabStyle('analysis')} onClick={() => setActiveTab('analysis')}>
          Financial Analysis
          {feasibility.flag !== 'GO' && (
            <span style={{ marginLeft: 6, fontSize: 10, padding: '2px 6px', borderRadius: 10, background: 'rgba(255,165,0,0.3)' }}>
              ⚠ Feasibility {feasibility.flag}
            </span>
          )}
        </button>
      </div>

      {/* FEASIBILITY TAB */}
      {activeTab === 'feasibility' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
          <div className="card" style={{ padding: 20 }}>
            <Section title="Lot & Coverage">
              <Field label="Lot Size (sq ft)" hint="Auto-filled from county data">
                <FInput {...register('lotSizeSqft')} type="number" min="0" />
              </Field>
              <Field label="Existing Structure Coverage (sq ft)" hint="Total living area of existing buildings">
                <FInput {...register('existingCoverageSqft')} type="number" min="0" />
              </Field>
              <Field label="Zoning Code" hint="Auto-filled from county data (e.g. RS-1-7)">
                <FInput {...register('zoningCode')} placeholder="e.g. RS-1-7" />
              </Field>
              <Field label="ADUs Planned">
                <FInput {...register('aduCount')} type="number" min="1" max="4" />
              </Field>
            </Section>

            <Section title="Setback Compliance">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <CheckRow label="Front setback compliant" checked={Boolean(values.setbackFront)} onChange={v => setValue('setbackFront', v)} />
                <CheckRow label="Rear setback compliant (min 4ft for ADU)" checked={Boolean(values.setbackRear)} onChange={v => setValue('setbackRear', v)} />
                <CheckRow label="Side setback compliant" checked={Boolean(values.setbackSide)} onChange={v => setValue('setbackSide', v)} />
              </div>
            </Section>

            <Section title="Utilities">
              <UtilityToggle label="Water Capacity" value={values.utilityWater} onChange={v => setValue('utilityWater', v)} />
              <UtilityToggle label="Sewer Capacity" value={values.utilitySewer} onChange={v => setValue('utilitySewer', v)} />
            </Section>

            <Section title="HOA & Permits">
              <div style={{ marginBottom: 12 }}>
                <CheckRow label="HOA present (may restrict ADU)" checked={Boolean(values.hasHOA)} onChange={v => setValue('hasHOA', v)} />
              </div>
              <Field label="Permit Timeline (months)">
                <FInput {...register('permitTimelineMonths')} type="number" min="1" max="36" />
              </Field>
              <Field label="Permit Cost Estimate ($)">
                <FInput {...register('permitCostEstimate')} type="number" min="0" />
              </Field>
            </Section>
          </div>

          <div style={{ position: 'sticky', top: 80 }}>
            <FeasibilityScoreCard result={feasibility} />
          </div>
        </div>
      )}

      {/* ANALYSIS TAB */}
      {activeTab === 'analysis' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {feasibility.flag !== 'GO' && (
            <div style={{ padding: '12px 16px', borderRadius: 8, background: 'color-mix(in srgb, var(--color-warning) 10%, transparent)', border: '1px solid var(--color-warning)', fontSize: 13, color: 'var(--color-warning)' }}>
              ⚠ Feasibility score is {feasibility.totalScore}/100 ({feasibility.flag}). Review the Feasibility tab before finalizing this analysis.
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
            <div>
              <div className="card" style={{ padding: 20 }}>
                <Section title="Construction">
                  <Field label="Number of ADUs">
                    <FInput {...register('aduCount')} type="number" min="1" max="4" />
                  </Field>
                  <Field label="Total Construction Cost ($)">
                    <FInput {...register('constructionCost')} type="number" min="0" />
                  </Field>
                  <Field label="Market-Rate Units">
                    <FInput {...register('marketRateUnits')} type="number" min="0" max="4" />
                  </Field>
                  <Field label="Middle-Income Units">
                    <FInput {...register('middleIncomeUnits')} type="number" min="0" max="4" />
                  </Field>
                </Section>

                <Section title="Rental Income">
                  <Field label="Market-Rate Rent ($/unit/mo)">
                    <FInput {...register('marketRateRent')} type="number" min="0" />
                  </Field>
                  <Field label="Middle-Income Rent ($/unit/mo)">
                    <FInput {...register('middleIncomeRent')} type="number" min="0" />
                  </Field>
                  <Field label="Vacancy Rate" hint="0.05 = 5%">
                    <FInput {...register('vacancyRate')} type="number" step="0.01" min="0" max="1" />
                  </Field>
                  <Field label="Operating Expense Ratio" hint="0.30 = 30% of EGI">
                    <FInput {...register('opExpRatio')} type="number" step="0.01" min="0" max="1" />
                  </Field>
                </Section>

                <Section title="Growth & Exit">
                  <Field label="Annual Rent Growth" hint="0.055 = 5.5%">
                    <FInput {...register('annualRentGrowth')} type="number" step="0.005" min="0" max="0.20" />
                  </Field>
                  <Field label="Hold Period (years)">
                    <FInput {...register('holdPeriodYears')} type="number" min="1" max="30" />
                  </Field>
                  <Field label="Exit Cap Rate" hint="0.05 = 5%">
                    <FInput {...register('exitCapRate')} type="number" step="0.005" min="0.01" max="0.15" />
                  </Field>
                </Section>

                <Section title="Investor Structure">
                  <Field label="Total Equity Invested ($)" hint="Purchase + construction">
                    <FInput {...register('equityInvested')} type="number" min="0" />
                  </Field>
                  <Field label="Preferred Return" hint="0.06 = 6% (RBD default)">
                    <FInput {...register('preferredReturnRate')} type="number" step="0.01" min="0" max="0.20" />
                  </Field>
                  <Field label="Sponsor Split" hint="0.70 = 70% Sponsor / 30% Investor">
                    <FInput {...register('sponsorSplit')} type="number" step="0.05" min="0" max="1" />
                  </Field>
                </Section>
              </div>
            </div>

            <div style={{ position: 'sticky', top: 80, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {analysis && <ADUMetricsPanel metrics={analysis} />}
            </div>
          </div>

          {analysis && <ADUProForma rows={analysis.proForma} holdPeriodYears={Number(values.holdPeriodYears)} />}
        </div>
      )}

      <button type="submit" disabled={saving} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
        {saving ? <RefreshCw size={15} className="spinning" /> : <Save size={15} />}
        {saving ? 'Saving…' : projectId ? 'Update Project' : 'Save Project'}
      </button>
    </form>
  )
}
