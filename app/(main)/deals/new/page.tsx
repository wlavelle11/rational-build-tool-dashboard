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
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <p className="page-eyebrow">New Deal</p>
          <h1 className="page-title">Deal Analysis</h1>
          <p className="page-description">Enter deal assumptions to model returns in real time</p>
        </div>
      </div>
      <DealForm defaultValues={defaultValues} />
    </div>
  )
}
