import { ResidentialForm } from '@/components/residential/ResidentialForm'

export const dynamic = 'force-dynamic'

export default function NewResidentialPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const address       = typeof searchParams.address       === 'string' ? searchParams.address       : undefined
  const purchasePrice = typeof searchParams.purchasePrice === 'string' ? Number(searchParams.purchasePrice) : undefined
  const name          = typeof searchParams.name          === 'string' ? searchParams.name          : undefined

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
