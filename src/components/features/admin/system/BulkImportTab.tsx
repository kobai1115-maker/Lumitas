import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, Users, AlertCircle, CheckCircle2, ChevronRight, X, Loader2 } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { clsx } from 'clsx'

type Corporation = {
  id: string
  name: string
}

type ParsedUser = {
  email: string
  password?: string
  fullName: string
  staffId: string
  role: string
  department: string
  _rawRow: number
}

// 役職マッピング例
function mapRole(rawRole: string): string {
  if (!rawRole) return 'GENERAL'
  if (rawRole.includes('法人管理')) return 'MAIN_ADMIN'
  if (rawRole.includes('管理') || rawRole.includes('施設長')) return 'SUB_ADMIN'
  return 'GENERAL'
}

export function BulkImportTab({ corporations }: { corporations: Corporation[] }) {
  const [selectedTenantId, setSelectedTenantId] = useState<string>('')
  const [users, setUsers] = useState<ParsedUser[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [results, setResults] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const xlsx = await import('xlsx')
        const data = new Uint8Array(event.target?.result as ArrayBuffer)
        const workbook = xlsx.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = xlsx.utils.sheet_to_json<any>(worksheet, { defval: '' })

        const parsedUsers: ParsedUser[] = jsonData.map((row, index) => {
          return {
            email: String(row['メールアドレス'] || '').trim(),
            password: 'Password123!', // 仮のパスワード
            fullName: String(row['氏名'] || '').trim(),
            staffId: String(row['職員ID'] || '').trim(),
            role: mapRole(String(row['役職'] || '')),
            department: String(row['部署'] || '').trim(),
            _rawRow: index + 2
          }
        }).filter(u => u.email && u.staffId)

        if (parsedUsers.length === 0) {
          toast.error('有効なユーザーが見つかりませんでした。テンプレートの列名を確認してください。')
        } else {
          setUsers(parsedUsers)
          toast.success(`${parsedUsers.length}名のユーザーを読み込みました`)
        }
      } catch (err) {
        console.error(err)
        toast.error('ファイルのパースに失敗しました')
      } finally {
        setIsUploading(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleImport = async () => {
    if (!selectedTenantId) {
      toast.error('法人（テナント）を選択してください')
      return
    }
    if (users.length === 0) return

    setIsImporting(true)
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data: { session } } = await supabase.auth.getSession()
      
      const res = await fetch('/api/admin/users/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': session?.access_token ? `Bearer ${session.access_token}` : ''
        },
        body: JSON.stringify({
          tenantId: selectedTenantId,
          userList: users.map(u => ({
            email: u.email,
            password: u.password,
            fullName: u.fullName,
            staffId: u.staffId,
            role: u.role,
            department: u.department
          }))
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'エラーが発生しました')
      }

      setResults(data.results)
      toast.success('インポート処理が完了しました')

    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 左側：設定・アップロード */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-2xl shadow-gray-100 rounded-[2.5rem] bg-white overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <div className="w-12 h-12 rounded-[1.25rem] bg-indigo-50 flex items-center justify-center text-indigo-500 mb-4 shadow-inner">
                <Upload className="w-6 h-6" />
              </div>
              <CardTitle className="text-xl font-black tracking-tight text-gray-900">
                Excelデータの読み込み
              </CardTitle>
              <CardDescription className="font-bold text-gray-400 mt-2">
                専用テンプレートを使用して一括登録
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              
              <div className="space-y-3">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">
                  対象法人（テナント）
                </label>
                <select 
                  className="w-full h-14 pl-4 pr-10 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-gray-700 appearance-none"
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                >
                  <option value="">法人を選択してください</option>
                  {corporations.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div 
                className="border-2 border-dashed border-gray-200 rounded-[1.5rem] p-8 text-center hover:bg-gray-50 hover:border-indigo-300 transition-all cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".xlsx, .xls" 
                  onChange={handleFileUpload} 
                />
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 bg-white rounded-xl shadow-sm text-gray-400 group-hover:text-indigo-500 transition-colors">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-700 text-sm">クリックしてファイルを選択</p>
                    <p className="text-xs text-gray-400 font-medium mt-1">.xlsx または .xls</p>
                  </div>
                </div>
              </div>

              {users.length > 0 && (
                <Button 
                  onClick={handleImport}
                  disabled={!selectedTenantId || isImporting}
                  className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-xl shadow-indigo-200 transition-all active:scale-[0.98]"
                >
                  {isImporting ? (
                    <><Loader2 className="w-5 h-5 mr-3 animate-spin" />インポート処理中...</>
                  ) : (
                    <><Users className="w-5 h-5 mr-3" />読み込んだ {users.length} 名を登録実行</>
                  )}
                </Button>
              )}

            </CardContent>
          </Card>
        </div>

        {/* 右側：プレビュー＆結果 */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-xl shadow-gray-100 rounded-[2.5rem] bg-white overflow-hidden min-h-[400px]">
            <CardHeader className="p-8 pb-4 border-b border-gray-50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black tracking-tight text-gray-900">
                  プレビュー / 結果
                </CardTitle>
                <CardDescription className="font-bold text-gray-400 mt-1">
                  {users.length > 0 ? `${users.length} 件のデータが読み込まれました` : 'データがアップロードされていません'}
                </CardDescription>
              </div>
              {results && (
                <div className="flex items-center gap-2">
                   <Badge className="bg-green-100 text-green-700 py-1.5 px-3 rounded-lg border-none font-bold">
                     成功: {results.filter((r:any) => r.status === 'success').length}
                   </Badge>
                   <Badge className="bg-red-100 text-red-700 py-1.5 px-3 rounded-lg border-none font-bold">
                     エラー: {results.filter((r:any) => r.status === 'error').length}
                   </Badge>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {users.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 text-gray-400">
                  <ListIcon className="w-12 h-12 mb-4 opacity-20" />
                  <p className="font-bold">まだデータがありません</p>
                  <p className="text-xs">左のパネルからExcelファイルをアップロードしてください</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50/50 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 whitespace-nowrap">ステータス</th>
                        <th className="px-6 py-4 whitespace-nowrap">職員ID</th>
                        <th className="px-6 py-4 whitespace-nowrap">氏名</th>
                        <th className="px-6 py-4 whitespace-nowrap">メールアドレス</th>
                        <th className="px-6 py-4 whitespace-nowrap">部署 / 役職</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {users.map((user, idx) => {
                        const resInfo = results?.find((r:any) => r.email === user.email);
                        return (
                          <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              {!resInfo ? (
                                <Badge variant="outline" className="text-gray-500 font-bold border-gray-200">待機中</Badge>
                              ) : resInfo.status === 'success' ? (
                                <div className="flex items-center gap-2 text-green-600 font-black">
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span className="text-xs">{resInfo.isNewUser ? '新規作成' : '兼務追加'}</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-red-500 font-black" title={resInfo.message}>
                                  <AlertCircle className="w-4 h-4" />
                                  <span className="text-xs truncate max-w-[100px]">エラー</span>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 font-bold text-gray-900">{user.staffId}</td>
                            <td className="px-6 py-4 font-bold text-gray-700">{user.fullName}</td>
                            <td className="px-6 py-4 text-xs font-mono text-gray-500">{user.email}</td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-gray-800">{user.department || '-'}</span>
                                <span className="text-[10px] text-gray-400 uppercase font-black">{user.role}</span>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}

function ListIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <path d="M3 6h.01" />
      <path d="M3 12h.01" />
      <path d="M3 18h.01" />
    </svg>
  )
}
