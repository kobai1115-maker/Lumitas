/**
 * PrismaのPascalCaseリレーション名をフロントエンドが期待するlowercase形式に自動変換/エイリアス付与するユーティリティ
 */
export function withCompat(data: any): any {
  if (data === null || data === undefined) return data;

  // 配列の場合は各要素を処理
  if (Array.isArray(data)) {
    return data.map(withCompat);
  }

  // オブジェクトの場合
  if (typeof data === 'object') {
    // Dateオブジェクトなどはそのまま返す
    if (data instanceof Date) return data;

    const newData: any = { ...data };

    for (const key of Object.keys(data)) {
      const value = data[key];

      // 再帰的にネストされた要素を処理
      newData[key] = withCompat(value);

      // 1. PascalCaseリレーションを小文字エイリアスにする (例: Corporation -> corporation)
      if (/^[A-Z]/.test(key)) {
        const lowerKey = key.charAt(0).toLowerCase() + key.slice(1);
        if (!(lowerKey in newData)) {
          newData[lowerKey] = newData[key];
        }

        // 組織図ツリー用の複数形エイリアス
        const pluralMappings: Record<string, string> = {
          'Division': 'divisions',
          'Facility': 'facilities',
          'Unit': 'units'
        };
        if (pluralMappings[key] && !(pluralMappings[key] in newData)) {
          newData[pluralMappings[key]] = newData[key];
        }
      }

      // 2. _countオブジェクト内のマッピング (例: Facility -> facilities)
      if (key === '_count' && value && typeof value === 'object') {
        const countData = { ...value };
        const mappings: Record<string, string> = {
          'Facility': 'facilities',
          'User': 'users',
          'Unit': 'units',
          'Division': 'divisions',
          'Goal': 'goals',
          'Evaluation': 'evaluations',
          'OneOnOneNote': 'oneOnOneNotes',
          'IncidentReport': 'incidentReports',
          'TrainingRecord': 'trainingRecords',
          'PeerBonus': 'peerBonuses'
        };

        for (const [pascal, lower] of Object.entries(mappings)) {
          if (pascal in countData) {
            countData[lower] = countData[pascal];
          }
        }
        newData[key] = countData;
      }
    }
    return newData;
  }

  return data;
}
