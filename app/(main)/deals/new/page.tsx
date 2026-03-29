import { DealForm } from '@/components/deals/DealForm'

interface Props {
  searchParams: Promise<Record<string, string>>
}

export default async function NewDealPage({ searchParams }: Props) {
  const params = await searchParams
  const defaultValues: Record<string, string | number> = {}

  const numericFields = ['units','purchasePrice','monthlyGrossRent','vacancyRate','operatingExpenseRatio','annualRentGrowth','annualExpenseGrowth','exitCapRate','equityInvested','acquisitionClosingCosts','renovationCapex','holdPeriodYears','preferredReturnRate','sponsorPromoteRate']
  const stringFields = ['name','neighborhood','address']

  for (const [key, val] of Object.entries(params)) {
    if (numericFields.includes(key)) defaultValues[key] = parseFloat(val)
    else if (stringFields.includes(key)) defaultValues[key] = val
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Deal Analysis</h1>
        <p className="text-sm text-gray-500 mt-1">Enter deal assumptions to analyze returns</p>
      </div>
      <DealForm defaultValues={defaultValues} />
    </div>
  )
}
