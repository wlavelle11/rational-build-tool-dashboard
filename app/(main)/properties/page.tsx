import { prisma } from '@/lib/prisma'
import { PropertyGrid } from '@/components/properties/PropertyGrid'

export const dynamic = 'force-dynamic'

export default async function PropertiesPage() {
  const properties = await prisma.property.findMany({ orderBy: { neighborhood: 'asc' } })

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <p className="page-eyebrow">Browse</p>
          <h1 className="page-title">Demo Properties</h1>
          <p className="page-description">Browse sample San Diego properties and load into the deal analyzer</p>
        </div>
      </div>
      <PropertyGrid properties={properties} />
    </div>
  )
}
