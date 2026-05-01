import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'media_dashboard',
});

const STAFFS = [
  { name: '张三', role: '运营' },
  { name: '李四', role: '摄像' },
  { name: '王五', role: '编剧' },
];

const ACCOUNTS = [
  '遇见约到家官方',
  '遇见约到家生活号',
  '遇见约到家服务号',
];

const PLATFORMS = ['知乎', '今日头条', '百家号'];

const TITLES = [
  '如何选择靠谱的家政服务',
  '家政服务行业发展趋势分析',
  '现代家庭保洁的注意事项',
];

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seed() {
  await AppDataSource.initialize();
  console.log('✅ 数据库连接成功');

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await queryRunner.query(
      `INSERT IGNORE INTO user (username, password, role) VALUES (?, ?, ?)`,
      ['admin', hashedPassword, 'admin'],
    );
    console.log('✅ 管理员账号创建: admin / admin123');

    try {
      await queryRunner.query(`DELETE FROM staffs`);
      for (const staff of STAFFS) {
        await queryRunner.query(
          `INSERT INTO staffs (name, role, isActive) VALUES (?, ?, ?)`,
          [staff.name, staff.role, true],
        );
      }
      console.log('✅ 人员数据插入完成 (3人)');
    } catch (err) {
      console.warn('⚠️ 跳过人员数据插入，表结构可能不一致');
    }

    await queryRunner.query(`DELETE FROM douyin_data`);
    for (const account of ACCOUNTS) {
      const date = new Date().toISOString().split('T')[0];
      await queryRunner.query(
        `INSERT INTO douyin_data (account_name, play_count, like_count, comment_count, share_count, create_time)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          account,
          rand(1000, 100000),
          rand(50, 10000),
          rand(10, 2000),
          rand(5, 1000),
          date,
        ],
      );
    }
    console.log('✅ 抖音数据插入完成 (3条)');

    await queryRunner.query(`DELETE FROM kuaishou_data`);
    const date = new Date().toISOString().split('T')[0];
    await queryRunner.query(
      `INSERT INTO kuaishou_data (exposure, viewers, duration, create_time)
       VALUES (?, ?, ?, ?)`,
      [rand(5000, 100000), rand(200, 10000), '60min', date],
    );
    console.log('✅ 快手数据插入完成 (1条)');

    await queryRunner.query(`DELETE FROM media_data`);
    for (const platform of PLATFORMS) {
      for (const title of TITLES) {
        const dateStr = new Date().toISOString().split('T')[0];
        await queryRunner.query(
          `INSERT INTO media_data (platform, title, read_count, like_count, comment_count, share_count, create_time)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            platform,
            title,
            rand(100, 50000),
            rand(10, 5000),
            rand(1, 1000),
            rand(1, 500),
            dateStr,
          ],
        );
      }
    }
    console.log('✅ 自媒体数据插入完成 (3平台 x 3文章)');

    try {
      await queryRunner.query(`DELETE FROM activity_logs`);
      const activities = [
        { staffName: '张三', action: '新增了', target: '抖音视频数据' },
        { staffName: '李四', action: '编辑了', target: '快手数据' },
        { staffName: '王五', action: '新增了', target: '自媒体文章' },
        { staffName: '张三', action: '新增了', target: '直播数据' },
        { staffName: '李四', action: '编辑了', target: '视频号数据' },
      ];
      for (const act of activities) {
        const time = new Date();
        time.setHours(rand(8, 18));
        await queryRunner.query(
          `INSERT INTO activity_logs (staff_id, staff_name, action, target, create_time)
           VALUES (?, ?, ?, ?, ?)`,
          [1, act.staffName, act.action, act.target, time],
        );
      }
      console.log('✅ 动态记录插入完成 (5条)');
    } catch (err) {
      console.warn('⚠️ 跳过动态记录插入，表结构可能不存在');
    }

    await queryRunner.commitTransaction();
    console.log('🎉 种子数据全部插入成功！');
  } catch (err) {
    await queryRunner.rollbackTransaction();
    console.error('❌ 种子数据插入失败:', err);
  } finally {
    await queryRunner.release();
    await AppDataSource.destroy();
  }
}

seed();
