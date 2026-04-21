'use client'

import { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, Upload, FileSpreadsheet, AlertCircle, CheckCircle2, X } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

type ImportItem = {
  divisionName: string
  facilityName: string
  unitName: string
}

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function OrganizationImportModal({ isOpen, onClose, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<ImportItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Excelファイルの読み込み
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    const { readExcelFirstSheet, getCellValue, ORG_HEADER_MAP } = await import('@/lib/excel-utils')

    try {
      const data = await readExcelFirstSheet(selectedFile)

      // データの整形 (カラム名のマッピングを考慮)
      const items: ImportItem[] = data.map(row => ({
        divisionName: getCellValue(row, ORG_HEADER_MAP.divisionName),
        facilityName: getCellValue(row, ORG_HEADER_MAP.facilityName),
        unitName: getCellValue(row, ORG_HEADER_MAP.unitName)
      })).filter(item => item.facilityName) // 事業所名がないものは除外

      setPreviewData(items)

      if (items.length === 0) {
        toast.error('有効な組織データが見つかりませんでした。ヘッダー名を確認してください。')
      } else {
        toast.success(`${items.length} 件のデータを読み込みました`)
      }
    } catch (err) {
      console.error('Excel parse error:', err)
      toast.error('Excelファイルの解析に失敗しました')
    }
  }

  // サーバーへ送信
  const handleImport = async () => {
    if (previewData.length === 0) return
    setIsUploading(true)

    try {
      const res = await fetch('/api/admin/organization/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: previewData })
      })

      if (res.ok) {
        const result = await res.json()
        toast.success(`インポート完了: 部門 ${result.results.divisions}件, 事業所 ${result.results.facilities}件, ユニット ${result.results.units}件`)
        onSuccess()
        onClose()
      } else {
        const err = await res.json()
        toast.error(err.error || 'インポートに失敗しました')
      }
    } catch (err) {
      toast.error('通信エラーが発生しました')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-white rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
        <div className="bg-gray-900 p-8 text-white relative">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-2xl">
              <FileSpreadsheet className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black">Excel一括登録</DialogTitle>
              <DialogDescription className="text-white/40 font-bold">
                組織階層（部・事業所・ユニット）をExcel形式でお手元で編集し、一括で反映します。
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* ファイル選択エリア */}
          {!file ? (
            <div className="border-2 border-dashed border-gray-100 rounded-[2rem] p-12 text-center hover:border-primary/30 transition-all bg-gray-50/30 group">
              <input 
                type="file" 
                accept=".xlsx, .xls" 
                className="hidden" 
                id="excel-upload" 
                onChange={handleFileChange}
              />
              <label htmlFor="excel-upload" className="cursor-pointer flex flex-col items-center">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-xl shadow-gray-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <p className="font-black text-gray-900 mb-2">Excelファイルを選択またはドロップ</p>
                <p className="text-xs text-gray-400 font-bold tracking-widest uppercase">.XLSX 形式 (最大 5MB)</p>
              </label>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="font-black text-emerald-900">{file.name}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => { setFile(null); setPreviewData([]); }}>
                  <X className="w-4 h-4 text-emerald-400" />
                </Button>
              </div>

              {/* プレビューテーブル */}
              <div className="border border-gray-100 rounded-2xl overflow-hidden max-h-[300px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">部門名</th>
                      <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">事業所名</th>
                      <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">ユニット名</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {previewData.map((item, i) => (
                      <tr key={i} className="hover:bg-gray-50/50">
                        <td className="p-4 text-sm font-bold text-gray-600">{item.divisionName || '-'}</td>
                        <td className="p-4 text-sm font-black text-gray-900">{item.facilityName}</td>
                        <td className="p-4 text-sm font-bold text-gray-500">{item.unitName || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex items-start gap-4 p-4 bg-rose-50 rounded-2xl text-rose-600 border border-rose-100">
             <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
             <div className="text-xs font-bold leading-relaxed">
               <p className="mb-1">既にある名称と一致する場合、その情報の更新（またはリレーションの再設定）が行われます。</p>
               <p>既存の組織構造を大幅に変更する場合は、事前にバックアップ（テンプレートDL等）を行うことを推奨します。</p>
             </div>
          </div>
        </div>

        <DialogFooter className="bg-gray-50 p-6 flex items-center justify-between">
          <Button variant="ghost" className="rounded-xl font-bold" onClick={onClose}>
            キャンセル
          </Button>
          <Button 
            className="rounded-xl px-10 font-black bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-200 shadow-xl shadow-gray-200"
            disabled={!file || previewData.length === 0 || isUploading}
            onClick={handleImport}
          >
            {isUploading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> 登録中...
              </div>
            ) : "インポートを実行する"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
