import { ADUForm } from '@/components/adu/ADUForm'

export const dynamic = 'force-dynamic'

export default function NewADUPage() {
  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <p className="page-eyebrow">ADU</p>
          <h1 className="page-title">New ADU Analysis</h1>
          <p className="page-description">Feasibility scoring + 10-year financial model for San Diego Bonus ADU development</p>
        </div>
      </div>
      <ADUForm />
    </div>
  )
}
