import * as XLSX from 'xlsx';
import * as path from 'path';

const data = [
  {
    '職員ID': '1000001',
    '氏名': '山田 太郎',
    'フリガナ': 'ヤマダ タロウ',
    'メールアドレス': 'yamada.t@example.com',
    '役職': '介護職',
    '事業所名': 'ケアグロウ東',
    'ユニット名': 'ゆり',
    '現在の等級': 3,
    '部署': '介護課'
  },
  {
    '職員ID': '1000002',
    '氏名': '佐藤 花子',
    'フリガナ': 'サトウ ハナコ',
    'メールアドレス': 'sato.h@example.com',
    '役職': '看護職',
    '事業所名': 'ケアグロウ東',
    'ユニット名': 'ひまわり',
    '現在の等級': 4,
    '部署': '看護部'
  },
  {
    '職員ID': '1000003',
    '氏名': '鈴木 一郎',
    'フリガナ': 'スズキ イチロウ',
    'メールアドレス': 'suzuki.i@example.com',
    '役職': '生活相談員',
    '事業所名': 'ケアグロウ本館',
    'ユニット名': '',
    '現在の等級': 5,
    '部署': '相談室'
  }
];

const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'StaffTemplate');

const filePath = path.join(process.cwd(), 'staff_import_template.xlsx');
XLSX.writeFile(wb, filePath);

console.log(`Excel template generated: ${filePath}`);
