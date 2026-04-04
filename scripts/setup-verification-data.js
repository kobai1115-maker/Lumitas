const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setup() {
  console.log('🏗️  検証用データのセットアップ（修正版）を開始します...');

  try {
    // 1. 2つ目の施設（施設B）を作成
    const facilityB = await prisma.facility.upsert({
      where: { id: 'test-facility-b' },
      update: {},
      create: {
        id: 'test-facility-b',
        name: 'サポートセンターあおい',
        corporationId: 'corp-001'
      }
    });
    console.log('✅ 施設Bを作成: ' + facilityB.name);

    // 2. 施設Bに所属する職員Bを作成
    const userB = await prisma.user.upsert({
      where: { staffId: '1ab0101' },
      update: {},
      create: {
        staffId: '1ab0101',
        fullName: '田中 次郎',
        email: 'tanaka.jiro@example.com',
        role: 'STAFF_CAREGIVER', // Enumに合わせる
        corporationId: 'corp-001',
        facilityId: facilityB.id,
        department: '介護係',
        gradeLevel: 1,
        isActive: true,
        mustChangePassword: false
      }
    });
    console.log('✅ 職員Bを作成: ' + userB.fullName + ' (ID: ' + userB.id + ')');

    // 3. 職員Bに紐付く目標を作成
    const goalB = await prisma.goal.create({
      data: {
        corporationId: 'corp-001',
        facilityId: facilityB.id,
        userId: userB.id,
        periodKey: '2026-H1',
        title: '利用者のADL維持に向けた個別レクの実施',
        targetValue: 3.0,
        currentValue: 1.0,
        unit: '回/週',
        isAchieved: false
      }
    });
    console.log('✅ 職員Bの個人目標を作成: ' + goalB.title);

    console.log('\n✨ セットアップ完了。隔離テストを実行可能な状態です。');
  } catch (err) {
    console.error('❌ セットアップ中にエラーが発生しました:', err);
  } finally {
    await prisma.$disconnect();
  }
}

setup();
