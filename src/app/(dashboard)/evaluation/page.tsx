import CompetencySlider from '@/components/features/evaluation/CompetencySlider'
import VoiceInputFab from '@/components/features/evaluation/VoiceInputFab'

export default function EvaluationPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-24 relative min-h-[85vh]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">評価・行動記録</h1>
        <p className="text-sm text-gray-500 mt-1 pb-2 border-b border-gray-100">
          自己評価の入力や、日々の「できたこと」を音声で残しましょう。
        </p>
      </div>

      <CompetencySlider />

      <div className="mt-12 pt-6 border-t border-gray-100 text-center">
        <h3 className="text-sm font-bold text-gray-700 mb-2">音声メモで「できたこと」を記録</h3>
        <p className="text-[10px] text-gray-400 max-w-sm mx-auto leading-relaxed mb-10">
          「今日こんな工夫をした」「ヒヤリハットを防いだ」などをマイクでつぶやくだけで、AIが人事考課用の客観的な文章に変換します。
        </p>

        {/* 画面下部に固定されるフローティングボタンコンポーネント */}
        <VoiceInputFab />
      </div>
    </div>
  )
}
