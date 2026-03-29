import { prisma } from '@/lib/prisma'
import { PropertyGrid } from '@/components/properties/PropertyGrid'

export const dynamic = 'force-dynamic'

export default async function PropertiesPage() {
  const properties = await prisma.property.findMany({ orderBy: { neighborhood: 'asc' } })
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Demo Properties</h1>
        <p className="text-sm text-gray-500 mt-1">Browse sample properties and load into the deal analyzer</p>
      </div>
      <PropertyGrid properties={properties} />
    </div>
  )
}
