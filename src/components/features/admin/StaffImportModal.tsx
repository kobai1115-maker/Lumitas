'use client'

import { useState } from 'react'
import * as XLSX from 'xlsx'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, Upload, FileSpreadsheet, AlertCircle, CheckCircle2, X, Users } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

type ImportStaffItem = {
  staffId: string
  fullName: string
  fullNameKana: string
  email: string
  roleName: string
  facilityName: string
  unitName: string
  gradeLevel: number
  department: string
}

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function StaffImportModal({ isOpen, onClose, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<ImportStaffItem[]>([])
  const [isUploading, setIsUploading] = useState(false)

  // Excelファイルの読み込み
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result
        const wb = XLSX.read(bstr, { type: 'binary' })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const data = XLSX.utils.sheet_to_json(ws) as any[]

        // データの整形 (カラム名のマッピングを考慮)
        const items: ImportStaffItem[] = data.map(row => ({
          staffId: String(row['職員ID'] || row['StaffId'] || ''),
          fullName: row['氏名'] || row['FullName'] || '',
          fullNameKana: row['フリガナ'] || row['FullNameKana'] || row['Kana'] || '',
          email: row['メールアドレス'] || row['Email'] || '',
          roleName: row['役職'] || row['Role'] || '介護職',
          facilityName: row['事業所名'] || row['Facility'] || '',
          unitName: row['ユニット名'] || row['Unit'] || '',
          gradeLevel: Number(row['現在の等級'] || row['Grade'] || 1),
          department: row['部署'] || row['Department'] || '介護課'
        })).filter(item => item.staffId && item.fullName)

        setPreviewData(items)
        toast.success(`${items.length} 名のスタッフデータを読み込みました`)
      } catch (err) {
        toast.error('Excelファイルの解析に失敗しました')
      }
    }
    reader.readAsBinaryString(selectedFile)
  }

  // サーバーへ送信
  const handleImport = async () => {
    if (previewData.length === 0) return
    setIsUploading(true)

    try {
      const res = await fetch('/api/admin/staff/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: previewData })
      })

      if (res.ok) {
        const result = await res.json()
        toast.success(`インポート完了: 新規 ${result.results.created}名, 更新(異動等) ${result.results.updated}名`)
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
      <DialogContent className="max-w-5xl bg-white rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
        <div className="bg-gray-900 p-8 text-white relative">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-2xl">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black">職員データ一括登録</DialogTitle>
              <DialogDescription className="text-white/40 font-bold">
                職員IDをキーに一括登録・更新を行います。人事異動や昇進に伴う属性変更も自動で反映されます。
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
                id="staff-excel-upload" 
                onChange={handleFileChange}
              />
              <label htmlFor="staff-excel-upload" className="cursor-pointer flex flex-col items-center">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-xl shadow-gray-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <p className="font-black text-gray-900 mb-2">職員名簿Excelを選択またはドロップ</p>
                <p className="text-xs text-gray-400 font-bold tracking-widest uppercase">.XLSX 形式 (最大 5MB)</p>
              </label>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-500" />
                  <span className="font-black text-blue-900">読み込み完了: {file.name}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => { setFile(null); setPreviewData([]); }}>
                  <X className="w-4 h-4 text-blue-400" />
                </Button>
              </div>

              {/* プレビューテーブル */}
              <div className="border border-gray-100 rounded-2xl overflow-hidden max-h-[350px] overflow-y-auto shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">職員ID</th>
                      <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">氏名</th>
                      <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-primary/40">フリガナ</th>
                      <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">役職</th>
                      <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">事業所</th>
                      <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">ユニット</th>
                      <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">等級</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {previewData.map((item, i) => (
                      <tr key={i} className="hover:bg-gray-50/50">
                        <td className="p-4 text-xs font-black text-gray-400">{item.staffId}</td>
                        <td className="p-4 text-sm font-black text-gray-900">{item.fullName}</td>
                        <td className="p-4 text-[10px] font-bold text-primary/60">{item.fullNameKana || '-'}</td>
                        <td className="p-4 text-xs font-bold text-gray-600">{item.roleName}</td>
                        <td className="p-4 text-xs font-bold text-gray-600">{item.facilityName || '-'}</td>
                        <td className="p-4 text-xs font-bold text-gray-500">{item.unitName || '-'}</td>
                        <td className="p-4 text-sm font-black text-primary text-center">{item.gradeLevel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-2xl text-amber-600 border border-amber-100">
             <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
             <div className="text-xs font-bold leading-relaxed">
               <p className="mb-1">職員IDが一致する場合、所属・等級・役職などは最新の内容に更新（上書き）されます。</p>
               <p>人事異動、昇進・降格、メールアドレスの変更などは、Excelの修正だけで一括同期が可能です。</p>
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
            ) : "職員リストをインポートする"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
