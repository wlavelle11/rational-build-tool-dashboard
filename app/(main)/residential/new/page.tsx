import { ResidentialForm } from '@/components/residential/ResidentialForm'

export const dynamic = 'force-dynamic'

export default async function NewResidentialPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const address       = typeof params.address       === 'string' ? params.address       : undefined
  const purchasePrice = typeof params.purchasePrice === 'string' ? Number(params.purchasePrice) : undefined
  const name          = typeof params.name          === 'string' ? params.name          : undefined

  const defaultValues = (address || purchasePrice || name)
    ? { address, name, purchasePrice: purchasePrice && !isNaN(purchasePrice) ? purchasePrice : undefined }
    : undefined

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <p className="page-eyebrow">Residential</p>
          <h1 className="page-title">New Analysis</h1>
          <p className="page-description">Compare Flip vs BRRR strategies for this property</p>
        </div>
      </div>
      <ResidentialForm defaultValues={defaultValues} />
    </div>
  )
}
