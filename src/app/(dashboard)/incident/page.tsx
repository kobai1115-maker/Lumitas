import IncidentForm from '@/components/features/incident/IncidentForm'

export default function IncidentPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-black tracking-tight text-gray-900">グッドキャッチ (インシデント報告)</h1>
        <p className="text-sm text-gray-500 mt-1">
          小さな気づきが大きな事故を防ぎます。
        </p>
      </div>

      <IncidentForm />
    </div>
  )
}
