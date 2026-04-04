const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 組織階層の初期化（データ移行）を開始します...');

  // 1. 全法人の取得
  const corporations = await prisma.corporation.findMany();
  console.log(`📊 ${corporations.length} 件の法人が見つかりました。`);

  for (const corp of corporations) {
    console.log(`\n🏢 法人: ${corp.name} (${corp.id}) の処理中...`);

    // 2. その法人の「本部 (デフォルト)」事業所を確認・作成
    let defaultFacility = await prisma.facility.findFirst({
      where: {
        corporationId: corp.id,
        name: '本部 (デフォルト)'
      }
    });

    if (!defaultFacility) {
      defaultFacility = await prisma.facility.create({
        data: {
          name: '本部 (デフォルト)',
          corporationId: corp.id
        }
      });
      console.log(`✅ デフォルト事業所「${defaultFacility.name}」を新規作成しました。`);
    } else {
      console.log(`ℹ️ 既にデフォルト事業所が存在します。ID: ${defaultFacility.id}`);
    }

    const facilityId = defaultFacility.id;

    // 3. 全データをデフォルト事業所に紐付け (一括更新)
    // 職員 (User)
    const userUpdate = await prisma.user.updateMany({
      where: { corporationId: corp.id, facilityId: null },
      data: { facilityId }
    });
    console.log(`👤 職員データを更新: ${userUpdate.count} 件`);

    // インシデント
    const incidentUpdate = await prisma.incidentReport.updateMany({
      where: { corporationId: corp.id, facilityId: null },
      data: { facilityId }
    });
    console.log(`🚑 インシデント報告を更新: ${incidentUpdate.count} 件`);

    // 目標
    const goalUpdate = await prisma.goal.updateMany({
      where: { corporationId: corp.id, facilityId: null },
      data: { facilityId }
    });
    console.log(`🎯 目標設定を更新: ${goalUpdate.count} 件`);

    // 評価
    const evaluationUpdate = await prisma.evaluation.updateMany({
      where: { corporationId: corp.id, facilityId: null },
      data: { facilityId }
    });
    console.log(`📋 評価記録を更新: ${evaluationUpdate.count} 件`);

    // ピアボーナス (既存全件)
    const bonusUpdate = await prisma.peerBonus.updateMany({
      where: { corporationId: corp.id, facilityId: null },
      data: { facilityId }
    });
    console.log(`🎁 ピアボーナスを更新: ${bonusUpdate.count} 件`);

    // 1on1
    const oneOnOneUpdate = await prisma.oneOnOneNote.updateMany({
      where: { corporationId: corp.id, facilityId: null },
      data: { facilityId }
    });
    console.log(`💬 1on1面談記録を更新: ${oneOnOneUpdate.count} 件`);

    // 研修記録
    const trainingUpdate = await prisma.trainingRecord.updateMany({
      where: { corporationId: corp.id, facilityId: null },
      data: { facilityId }
    });
    console.log(`🎓 研修記録を更新: ${trainingUpdate.count} 件`);

    // 健康ログ
    const healthUpdate = await prisma.healthLog.updateMany({
      where: { corporationId: corp.id, facilityId: null },
      data: { facilityId }
    });
    console.log(`🏃 健康ログを更新: ${healthUpdate.count} 件`);
  }

  console.log('\n✨ 組織階層の初期化がすべて完了しました！');
}

main()
  .catch((e) => {
    console.error('❌ エラーが発生しました:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
