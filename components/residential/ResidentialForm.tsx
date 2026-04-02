'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { residentialSchema, type ResidentialFormValues } from '@/lib/validations'
import { calculateFlip } from '@/lib/finance/flip'
import { calculateBRRR } from '@/lib/finance/brrr'
import type { FlipMetrics } from '@/lib/finance/flip'
import type { BRRRMetrics } from '@/lib/finance/brrr'
import { FlipPanel } from './FlipPanel'
import { BRRRPanel } from './BRRRPanel'
import { ComparisonSummary } from './ComparisonSummary'
import { Save, RefreshCw } from 'lucide-react'

interface Props {
  defaultValues?: Partial<ResidentialFormValues>
  projectId?: string
}

const BASE_DEFAULTS: ResidentialFormValues = {
  name: '',
  neighborhood: '',
  address: '',
  purchasePrice: 350000,
  renovationBudget: 75000,
  arv: 550000,
  buyClosingCosts: 7000,

  flipInvestorCapital: 200000,
  flipHoldMonths: 6,
  flipMonthlyCarrying: 2500,
  flipSellClosingPct: 0.07,
  flipFinancingType: 'cash',
  flipHardMoneyLtvPct: 0.70,
  flipHardMoneyRate: 0.12,
  flipHardMoneyPoints: 0.02,

  brrrInvestorCapital: 200000,
  brrrHoldYears: 10,
  brrrMonthlyRent: 2800,
  brrrOpExpRatio: 0.35,
  brrrReservePct: 0.05,
  brrrRefinanceLtv: 0.75,
  brrrRefinanceRate: 0.07,
  brrrRefinanceTerm: 30,
  brrrTargetYield: 0.08,
  brrrEquitySplit: 0.50,
  brrrFinancingType: 'cash',
  brrrHardMoneyLtvPct: 0.70,
  brrrHardMoneyRate: 0.12,
  brrrHardMoneyPoints: 0.02,
  brrrRenovationMonths: 6,
}

function deriveMetrics(values: ResidentialFormValues): { flip: FlipMetrics; brrr: BRRRMetrics } {
  const flip = calculateFlip({
    purchasePrice: values.purchasePrice,
    renovationBudget: values.renovationBudget,
    arv: values.arv,
    holdPeriodMonths: values.flipHoldMonths,
    buyClosingCosts: values.buyClosingCosts,
    sellClosingCostsPct: values.flipSellClosingPct,
    investorCapital: values.flipInvestorCapital,
    monthlyCarryingCosts: values.flipMonthlyCarrying,
    financingType: values.flipFinancingType,
    hardMoneyLtvPct: values.flipHardMoneyLtvPct,
    hardMoneyRate: values.flipHardMoneyRate,
    hardMoneyPoints: values.flipHardMoneyPoints,
  })

  const brrr = calculateBRRR({
    purchasePrice: values.purchasePrice,
    renovationBudget: values.renovationBudget,
    arv: values.arv,
    buyClosingCosts: values.buyClosingCosts,
    holdPeriodYears: values.brrrHoldYears,
    investorCapital: values.brrrInvestorCapital,
    targetCashYieldPct: values.brrrTargetYield,
    equitySplitAtSalePct: values.brrrEquitySplit,
    monthlyRent: values.brrrMonthlyRent,
    operatingExpenseRatio: values.brrrOpExpRatio,
    operatingReservePct: values.brrrReservePct,
    refinanceLtv: values.brrrRefinanceLtv,
    refinanceRate: values.brrrRefinanceRate,
    refinanceLoanTermYears: values.brrrRefinanceTerm,
    financingType: values.brrrFinancingType,
    hardMoneyLtvPct: values.brrrHardMoneyLtvPct,
    hardMoneyRate: values.brrrHardMoneyRate,
    hardMoneyPoints: values.brrrHardMoneyPoints,
    renovationMonths: values.brrrRenovationMonths,
  })

  return { flip, brrr }
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

function FormInput({ error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return <input className={`input${error ? ' error' : ''}`} {...props} />
}

function FinancingToggle({ value, onChange }: { value: 'cash' | 'hard_money'; onChange: (v: 'cash' | 'hard_money') => void }) {
  return (
    <div style={{ display: 'flex', gap: 4, background: 'var(--color-surface-raised)', padding: 3, borderRadius: 8, width: 'fit-content', marginBottom: 12 }}>
      {(['cash', 'hard_money'] as const).map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          style={{
            padding: '5px 14px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            background: value === opt ? 'var(--color-brand)' : 'transparent',
            color: value === opt ? '#fff' : 'var(--color-text-secondary)',
            transition: 'all 0.15s',
          }}
        >
          {opt === 'cash' ? 'Cash' : 'Hard Money'}
        </button>
      ))}
    </div>
  )
}

export function ResidentialForm({ defaultValues, projectId }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const merged = { ...BASE_DEFAULTS, ...defaultValues }

  const [liveMetrics, setLiveMetrics] = useState(() => deriveMetrics(merged as ResidentialFormValues))

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ResidentialFormValues>({
    resolver: zodResolver(residentialSchema) as Resolver<ResidentialFormValues>,
    defaultValues: merged,
  })

  const values = watch()
  const flipFinancing = watch('flipFinancingType')
  const brrrFinancing = watch('brrrFinancingType')

  useEffect(() => {
    try {
      setLiveMetrics(deriveMetrics(values as ResidentialFormValues))
    } catch { /* ignore partial */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(values)])

  const onSubmit = async (data: ResidentialFormValues) => {
    setSaving(true)
    try {
      const url = projectId ? `/api/residential/${projectId}` : '/api/residential'
      const method = projectId ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (!res.ok) throw new Error('Save failed')
      const project = await res.json()
      router.push(`/residential`)
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Shared Property Inputs ── */}
      <div className="card" style={{ padding: 24 }}>
        <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: 'var(--color-text-primary)' }}>Property Information</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Project Name" error={errors.name?.message}>
            <FormInput {...register('name')} placeholder="e.g. 123 Oak St Flip/BRRR" error={errors.name?.message} />
          </Field>
          <Field label="Neighborhood / Submarket" error={errors.neighborhood?.message}>
            <FormInput {...register('neighborhood')} placeholder="e.g. South Park" error={errors.neighborhood?.message} />
          </Field>
          <Field label="Address (Optional)">
            <FormInput {...register('address')} placeholder="Street address" />
          </Field>
          <Field label="Purchase Price ($)" error={errors.purchasePrice?.message}>
            <FormInput {...register('purchasePrice')} type="number" min="0" error={errors.purchasePrice?.message} />
          </Field>
          <Field label="Renovation Budget ($)">
            <FormInput {...register('renovationBudget')} type="number" min="0" />
          </Field>
          <Field label="ARV — After Repair Value ($)" error={errors.arv?.message}>
            <FormInput {...register('arv')} type="number" min="0" error={errors.arv?.message} />
          </Field>
          <Field label="Buy-Side Closing Costs ($)" hint="Title, escrow, transfer taxes">
            <FormInput {...register('buyClosingCosts')} type="number" min="0" />
          </Field>
        </div>
      </div>

      {/* ── Side-by-side strategy inputs ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* FLIP inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 3, height: 20, background: 'var(--color-brand)', borderRadius: 2 }} />
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>Flip Analysis</p>
          </div>

          <div className="card" style={{ padding: 16 }}>
            <Section title="Financing">
              <FinancingToggle
                value={flipFinancing}
                onChange={(v) => setValue('flipFinancingType', v)}
              />
              {flipFinancing === 'hard_money' && (
                <>
                  <Field label="Loan-to-Value (%)" hint="0.70 = 70% of purchase price">
                    <FormInput {...register('flipHardMoneyLtvPct')} type="number" step="0.01" min="0" max="1" />
                  </Field>
                  <Field label="Interest Rate (annualized)" hint="0.12 = 12%">
                    <FormInput {...register('flipHardMoneyRate')} type="number" step="0.005" min="0" max="0.30" />
                  </Field>
                  <Field label="Origination Points" hint="0.02 = 2%">
                    <FormInput {...register('flipHardMoneyPoints')} type="number" step="0.005" min="0" max="0.10" />
                  </Field>
                </>
              )}
            </Section>

            <Section title="Flip Details">
              <Field label="Investor Capital ($)" error={errors.flipInvestorCapital?.message}>
                <FormInput {...register('flipInvestorCapital')} type="number" min="0" error={errors.flipInvestorCapital?.message} />
              </Field>
              <Field label="Hold Period (months)">
                <FormInput {...register('flipHoldMonths')} type="number" min="1" max="36" />
              </Field>
              <Field label="Monthly Carrying Costs ($)" hint="Insurance, utilities, taxes, interest">
                <FormInput {...register('flipMonthlyCarrying')} type="number" min="0" />
              </Field>
              <Field label="Sell-Side Closing Costs" hint="0.07 = 7% (agent commissions + fees)">
                <FormInput {...register('flipSellClosingPct')} type="number" step="0.005" min="0" max="0.15" />
              </Field>
            </Section>
          </div>

          <FlipPanel metrics={liveMetrics.flip} financingType={flipFinancing} />
        </div>

        {/* BRRR inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 3, height: 20, background: 'var(--color-success)', borderRadius: 2 }} />
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>BRRR Analysis</p>
          </div>

          <div className="card" style={{ padding: 16 }}>
            <Section title="Financing">
              <FinancingToggle
                value={brrrFinancing}
                onChange={(v) => setValue('brrrFinancingType', v)}
              />
              {brrrFinancing === 'hard_money' && (
                <>
                  <Field label="Bridge Loan LTV" hint="0.70 = 70% of purchase price">
                    <FormInput {...register('brrrHardMoneyLtvPct')} type="number" step="0.01" min="0" max="1" />
                  </Field>
                  <Field label="Bridge Interest Rate" hint="0.12 = 12%">
                    <FormInput {...register('brrrHardMoneyRate')} type="number" step="0.005" min="0" max="0.30" />
                  </Field>
                  <Field label="Origination Points" hint="0.02 = 2%">
                    <FormInput {...register('brrrHardMoneyPoints')} type="number" step="0.005" min="0" max="0.10" />
                  </Field>
                  <Field label="Renovation Period (months)">
                    <FormInput {...register('brrrRenovationMonths')} type="number" min="1" max="24" />
                  </Field>
                </>
              )}
            </Section>

            <Section title="Rental Income">
              <Field label="Investor Capital ($)" error={errors.brrrInvestorCapital?.message}>
                <FormInput {...register('brrrInvestorCapital')} type="number" min="0" error={errors.brrrInvestorCapital?.message} />
              </Field>
              <Field label="Stabilized Monthly Rent ($)" error={errors.brrrMonthlyRent?.message}>
                <FormInput {...register('brrrMonthlyRent')} type="number" min="0" error={errors.brrrMonthlyRent?.message} />
              </Field>
              <Field label="Operating Expense Ratio" hint="0.35 = 35% of gross rent">
                <FormInput {...register('brrrOpExpRatio')} type="number" step="0.01" min="0" max="1" />
              </Field>
              <Field label="Operating Reserve %" hint="0.05 = 5% set aside from rent">
                <FormInput {...register('brrrReservePct')} type="number" step="0.01" min="0" max="0.20" />
              </Field>
            </Section>

            <Section title="Refinance & Hold">
              <Field label="Refinance LTV" hint="0.75 = 75% of ARV">
                <FormInput {...register('brrrRefinanceLtv')} type="number" step="0.01" min="0" max="0.90" />
              </Field>
              <Field label="Refinance Rate" hint="0.07 = 7%">
                <FormInput {...register('brrrRefinanceRate')} type="number" step="0.005" min="0" max="0.20" />
              </Field>
              <Field label="Loan Term (years)">
                <FormInput {...register('brrrRefinanceTerm')} type="number" min="5" max="40" />
              </Field>
              <Field label="Hold Period (years)">
                <FormInput {...register('brrrHoldYears')} type="number" min="1" max="30" />
              </Field>
            </Section>

            <Section title="Investor Terms">
              <Field label="Target Cash Yield" hint="0.08 = 8% (RBD default)">
                <FormInput {...register('brrrTargetYield')} type="number" step="0.005" min="0" max="0.20" />
              </Field>
              <Field label="Investor Equity Split at Sale" hint="0.50 = 50% of net equity">
                <FormInput {...register('brrrEquitySplit')} type="number" step="0.05" min="0" max="1" />
              </Field>
            </Section>
          </div>

          <BRRRPanel metrics={liveMetrics.brrr} financingType={brrrFinancing} />
        </div>
      </div>

      {/* ── Comparison Summary ── */}
      <ComparisonSummary
        flipMetrics={liveMetrics.flip}
        brrrMetrics={liveMetrics.brrr}
        holdMonths={values.flipHoldMonths}
        brrrHoldYears={values.brrrHoldYears}
      />

      <button
        type="submit"
        disabled={saving}
        className="btn btn-primary btn-lg"
        style={{ width: '100%' }}
      >
        {saving ? <RefreshCw size={15} className="spinning" /> : <Save size={15} />}
        {saving ? 'Saving…' : projectId ? 'Update Project' : 'Save Project'}
      </button>
    </form>
  )
}
