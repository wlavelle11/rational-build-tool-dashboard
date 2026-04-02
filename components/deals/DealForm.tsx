'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { dealSchema, type DealFormValues } from '@/lib/validations'
import { analyzeDeal } from '@/lib/finance'
import type { DealMetrics } from '@/lib/finance/types'
import { MetricsCards } from './MetricsCards'
import { RecommendationBadge } from './RecommendationBadge'
import { Save, RefreshCw } from 'lucide-react'

interface Props {
  defaultValues?: Partial<DealFormValues>
  dealId?: string
}

const BASE_DEFAULTS: DealFormValues = {
  name: '',
  neighborhood: '',
  address: '',
  units: 6,
  purchasePrice: 2000000,
  monthlyGrossRent: 10500,
  vacancyRate: 0.05,
  operatingExpenseRatio: 0.25,
  annualRentGrowth: 0.05,
  annualExpenseGrowth: 0.03,
  holdPeriodYears: 10,
  exitCapRate: 0.05,
  acquisitionClosingCosts: 40000,
  renovationCapex: 0,
  equityInvested: 2040000,
  preferredReturnRate: 0.06,
  sponsorPromoteRate: 0.30,
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="form-section">
      <div className="form-section-header">
        <p className="form-section-title">{title}</p>
      </div>
      <div className="form-section-body">{children}</div>
    </div>
  )
}

interface FieldProps {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}

function Field({ label, hint, error, children }: FieldProps) {
  return (
    <div className="form-field">
      <label className="form-label">{label}</label>
      {children}
      {hint && !error && <p className="form-hint">{hint}</p>}
      {error && <p className="form-error">{error}</p>}
    </div>
  )
}

function FormInput({ error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return <input className={`input${error ? ' error' : ''}`} {...props} />
}

export function DealForm({ defaultValues, dealId }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const merged = { ...BASE_DEFAULTS, ...defaultValues }
  const [liveMetrics, setLiveMetrics] = useState<DealMetrics>(() => analyzeDeal(merged as DealFormValues))

  const { register, handleSubmit, watch, formState: { errors } } = useForm<DealFormValues>({
    resolver: zodResolver(dealSchema) as Resolver<DealFormValues>,
    defaultValues: merged,
  })

  const values = watch()

  useEffect(() => {
    try {
      setLiveMetrics(analyzeDeal(values as DealFormValues))
    } catch { /* ignore partial */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(values)])

  const onSubmit = async (data: DealFormValues) => {
    setSaving(true)
    try {
      const url = dealId ? `/api/deals/${dealId}` : '/api/deals'
      const method = dealId ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (!res.ok) throw new Error('Save failed')
      const deal = await res.json()
      router.push(`/multifamily/${deal.id}`)
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 32, alignItems: 'start' }}>
      {/* ── Form ── */}
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        <Section title="Deal Information">
          <Field label="Deal Name" error={errors.name?.message}>
            <FormInput {...register('name')} placeholder="e.g. North Park 6-Unit" error={errors.name?.message} />
          </Field>
          <Field label="Neighborhood / Submarket" error={errors.neighborhood?.message}>
            <FormInput {...register('neighborhood')} placeholder="e.g. North Park" error={errors.neighborhood?.message} />
          </Field>
          <Field label="Address (Optional)">
            <FormInput {...register('address')} placeholder="Street address" />
          </Field>
          <Field label="Number of Units" error={errors.units?.message}>
            <FormInput {...register('units')} type="number" min="1" error={errors.units?.message} />
          </Field>
        </Section>

        <Section title="Acquisition">
          <Field label="Purchase Price ($)" error={errors.purchasePrice?.message}>
            <FormInput {...register('purchasePrice')} type="number" min="0" error={errors.purchasePrice?.message} />
          </Field>
          <Field label="Closing Costs ($)" hint="Typically 1.5–2.5% of price">
            <FormInput {...register('acquisitionClosingCosts')} type="number" min="0" />
          </Field>
          <Field label="Renovation / CapEx ($)">
            <FormInput {...register('renovationCapex')} type="number" min="0" />
          </Field>
          <Field label="Total Equity Invested ($)" hint="Purchase + closing + capex" error={errors.equityInvested?.message}>
            <FormInput {...register('equityInvested')} type="number" min="0" error={errors.equityInvested?.message} />
          </Field>
        </Section>

        <Section title="Income & Expenses">
          <Field label="Monthly Gross Rent ($)" hint="All units combined">
            <FormInput {...register('monthlyGrossRent')} type="number" min="0" />
          </Field>
          <Field label="Vacancy Rate" hint="0.05 = 5%">
            <FormInput {...register('vacancyRate')} type="number" min="0" max="1" step="0.01" />
          </Field>
          <Field label="Operating Expense Ratio" hint="0.25 = 25% of EGI">
            <FormInput {...register('operatingExpenseRatio')} type="number" min="0" max="1" step="0.01" />
          </Field>
        </Section>

        <Section title="Growth & Exit">
          <Field label="Annual Rent Growth" hint="0.05 = 5%">
            <FormInput {...register('annualRentGrowth')} type="number" min="0" max="1" step="0.005" />
          </Field>
          <Field label="Annual Expense Growth" hint="Default 3%">
            <FormInput {...register('annualExpenseGrowth')} type="number" min="0" max="1" step="0.005" />
          </Field>
          <Field label="Hold Period (Years)">
            <FormInput {...register('holdPeriodYears')} type="number" min="1" max="30" />
          </Field>
          <Field label="Exit Cap Rate" hint="0.05 = 5%">
            <FormInput {...register('exitCapRate')} type="number" min="0.001" max="0.20" step="0.005" />
          </Field>
        </Section>

        <Section title="Capital Structure">
          <Field label="Preferred Return Rate" hint="LP pref: 0.06 = 6%">
            <FormInput {...register('preferredReturnRate')} type="number" min="0" max="0.30" step="0.01" />
          </Field>
          <Field label="Sponsor Promote Rate" hint="GP above pref: 0.30 = 30%">
            <FormInput {...register('sponsorPromoteRate')} type="number" min="0" max="0.50" step="0.05" />
          </Field>
        </Section>

        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary btn-lg"
          style={{ width: '100%', marginTop: 4 }}
        >
          {saving ? <RefreshCw size={15} className="spinning" /> : <Save size={15} />}
          {saving ? 'Saving…' : dealId ? 'Update Deal' : 'Save Deal'}
        </button>
      </form>

      {/* ── Live Analysis ── */}
      <div style={{ position: 'sticky', top: 80 }}>
        <div className="live-panel-header">
          <div>
            <p className="live-panel-eyebrow">Live Preview</p>
            <p className="live-panel-title">Analysis</p>
          </div>
          <RecommendationBadge
            recommendation={liveMetrics.recommendation}
            score={liveMetrics.dealScore}
          />
        </div>
        <MetricsCards metrics={liveMetrics} />
      </div>
    </div>
  )
}
