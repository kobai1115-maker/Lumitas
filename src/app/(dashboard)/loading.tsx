import { LoadingCharacter } from '@/components/ui/loading-character'

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <LoadingCharacter />
    </div>
  )
}
