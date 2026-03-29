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

function FieldGroup({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

function TextInput({ error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <div>
      <input className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white" {...props} />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
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
      const m = analyzeDeal(values as DealFormValues)
      setLiveMetrics(m)
    } catch {
      // ignore partial input
    }
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
      router.push(`/deals/${deal.id}`)
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div className="xl:col-span-1">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Deal Information</h3>
            <FieldGroup label="Deal Name">
              <TextInput {...register('name')} placeholder="e.g. North Park 6-Unit" error={errors.name?.message} />
            </FieldGroup>
            <FieldGroup label="Neighborhood / Submarket">
              <TextInput {...register('neighborhood')} placeholder="e.g. North Park" error={errors.neighborhood?.message} />
            </FieldGroup>
            <FieldGroup label="Address (Optional)">
              <TextInput {...register('address')} placeholder="Street address" />
            </FieldGroup>
            <FieldGroup label="Number of Units">
              <TextInput {...register('units')} type="number" min="1" error={errors.units?.message} />
            </FieldGroup>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Acquisition</h3>
            <FieldGroup label="Purchase Price ($)">
              <TextInput {...register('purchasePrice')} type="number" min="0" error={errors.purchasePrice?.message} />
            </FieldGroup>
            <FieldGroup label="Closing Costs ($)" hint="Typically 1.5–2.5% of purchase price">
              <TextInput {...register('acquisitionClosingCosts')} type="number" min="0" />
            </FieldGroup>
            <FieldGroup label="Renovation / CapEx ($)">
              <TextInput {...register('renovationCapex')} type="number" min="0" />
            </FieldGroup>
            <FieldGroup label="Total Equity Invested ($)" hint="Purchase + closing costs + capex">
              <TextInput {...register('equityInvested')} type="number" min="0" error={errors.equityInvested?.message} />
            </FieldGroup>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Income & Expenses</h3>
            <FieldGroup label="Monthly Gross Rent ($)" hint="Total monthly rent, all units">
              <TextInput {...register('monthlyGrossRent')} type="number" min="0" />
            </FieldGroup>
            <FieldGroup label="Vacancy Rate" hint="Decimal: 0.05 = 5%">
              <TextInput {...register('vacancyRate')} type="number" min="0" max="1" step="0.01" />
            </FieldGroup>
            <FieldGroup label="Operating Expense Ratio" hint="% of EGI: 0.25 = 25%">
              <TextInput {...register('operatingExpenseRatio')} type="number" min="0" max="1" step="0.01" />
            </FieldGroup>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Growth & Exit</h3>
            <FieldGroup label="Annual Rent Growth" hint="Decimal: 0.05 = 5%">
              <TextInput {...register('annualRentGrowth')} type="number" min="0" max="1" step="0.005" />
            </FieldGroup>
            <FieldGroup label="Annual Expense Growth" hint="Default 3%">
              <TextInput {...register('annualExpenseGrowth')} type="number" min="0" max="1" step="0.005" />
            </FieldGroup>
            <FieldGroup label="Hold Period (Years)">
              <TextInput {...register('holdPeriodYears')} type="number" min="1" max="30" />
            </FieldGroup>
            <FieldGroup label="Exit Cap Rate" hint="Decimal: 0.05 = 5%">
              <TextInput {...register('exitCapRate')} type="number" min="0.001" max="0.20" step="0.005" />
            </FieldGroup>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Capital Structure</h3>
            <FieldGroup label="Preferred Return Rate" hint="LP pref: 0.06 = 6%">
              <TextInput {...register('preferredReturnRate')} type="number" min="0" max="0.30" step="0.01" />
            </FieldGroup>
            <FieldGroup label="Sponsor Promote Rate" hint="GP share above pref: 0.30 = 30%">
              <TextInput {...register('sponsorPromoteRate')} type="number" min="0" max="0.50" step="0.05" />
            </FieldGroup>
          </div>

          <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving...' : dealId ? 'Update Deal' : 'Save Deal'}
          </button>
        </form>
      </div>

      <div className="xl:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Live Analysis</h2>
          <RecommendationBadge recommendation={liveMetrics.recommendation} score={liveMetrics.dealScore} />
        </div>
        <MetricsCards metrics={liveMetrics} />
      </div>
    </div>
  )
}
