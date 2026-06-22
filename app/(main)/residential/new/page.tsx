import { ResidentialForm } from '@/components/residential/ResidentialForm'
import { prisma } from '@/lib/prisma'
import type { ResidentialFormValues } from '@/lib/validations'

export const dynamic = 'force-dynamic'

export default async function NewResidentialPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const id = typeof params.id === 'string' ? params.id : undefined

  // Edit mode: load an existing project so the form updates it instead of creating a new one.
  const project = id ? await prisma.residentialProject.findUnique({ where: { id } }) : null
  const isEdit = Boolean(project)

  let defaultValues: Partial<ResidentialFormValues> | undefined

  if (project) {
    defaultValues = {
      name: project.name,
      neighborhood: project.neighborhood,
      address: project.address ?? '',
      purchasePrice: project.purchasePrice,
      renovationBudget: project.renovationBudget,
      arv: project.arv,
      buyClosingCosts: project.buyClosingCosts,
      flipInvestorCapital: project.flipInvestorCapital,
      flipHoldMonths: project.flipHoldMonths,
      flipMonthlyCarrying: project.flipMonthlyCarrying,
      flipSellClosingPct: project.flipSellClosingPct,
      flipFinancingType: project.flipFinancingType as 'cash' | 'hard_money',
      flipHardMoneyLtvPct: project.flipHardMoneyLtvPct ?? 0.70,
      flipHardMoneyRate: project.flipHardMoneyRate ?? 0.12,
      flipHardMoneyPoints: project.flipHardMoneyPoints ?? 0.02,
      brrrInvestorCapital: project.brrrInvestorCapital,
      brrrHoldYears: project.brrrHoldYears,
      brrrMonthlyRent: project.brrrMonthlyRent,
      brrrOpExpRatio: project.brrrOpExpRatio,
      brrrReservePct: project.brrrReservePct,
      brrrRefinanceLtv: project.brrrRefinanceLtv,
      brrrRefinanceRate: project.brrrRefinanceRate,
      brrrRefinanceTerm: project.brrrRefinanceTerm,
      brrrTargetYield: project.brrrTargetYield,
      brrrEquitySplit: project.brrrEquitySplit,
      brrrFinancingType: project.brrrFinancingType as 'cash' | 'hard_money',
      brrrHardMoneyLtvPct: project.brrrHardMoneyLtvPct ?? 0.70,
      brrrHardMoneyRate: project.brrrHardMoneyRate ?? 0.12,
      brrrHardMoneyPoints: project.brrrHardMoneyPoints ?? 0.02,
      brrrRenovationMonths: project.brrrRenovationMonths ?? 6,
    }
  } else {
    // Create mode: optional prefill from a lead.
    const address       = typeof params.address       === 'string' ? params.address       : undefined
    const purchasePrice = typeof params.purchasePrice === 'string' ? Number(params.purchasePrice) : undefined
    const name          = typeof params.name          === 'string' ? params.name          : undefined

    defaultValues = (address || purchasePrice || name)
      ? { address, name, purchasePrice: purchasePrice && !isNaN(purchasePrice) ? purchasePrice : undefined }
      : undefined
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <p className="page-eyebrow">Residential</p>
          <h1 className="page-title">{isEdit ? 'Edit Analysis' : 'New Analysis'}</h1>
          <p className="page-description">Compare Flip vs BRRR strategies for this property</p>
        </div>
      </div>
      <ResidentialForm projectId={project?.id} defaultValues={defaultValues} />
    </div>
  )
}
