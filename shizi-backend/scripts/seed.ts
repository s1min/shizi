/**
 * 数据种子脚本 — 将前端 JSON 数据导入 MongoDB
 *
 * 用法：
 *   npx ts-node scripts/seed.ts           # 增量导入（跳过已存在的）
 *   npx ts-node scripts/seed.ts --drop    # 清空后重新导入
 *
 * 需要 .env 中配置 MONGODB_URI
 */

import * as fs from 'fs';
import * as path from 'path';
import mongoose from 'mongoose';

// 手动加载 .env
const envPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shizi';
const DROP = process.argv.includes('--drop');

// 数据文件路径（相对于项目根目录）
const CHARACTERS_PATH = path.resolve(__dirname, '../../shizi-frontend/src/data/characters.json');
const LIBRARY_PATH = path.resolve(__dirname, '../../shizi-frontend/src/data/lib_1a_upper.json');

async function seed() {
  console.log(`连接数据库: ${MONGODB_URI}`);
  await mongoose.connect(MONGODB_URI);
  console.log('数据库连接成功');

  const db = mongoose.connection.db!;

  // === Characters ===
  const charsCollection = db.collection('characters');
  if (DROP) {
    await charsCollection.deleteMany({});
    console.log('已清空 characters 集合');
  }

  const characters: any[] = JSON.parse(fs.readFileSync(CHARACTERS_PATH, 'utf-8'));
  let charInserted = 0;
  let charSkipped = 0;

  for (const char of characters) {
    try {
      await charsCollection.updateOne(
        { _id: char._id },
        { $set: char },
        { upsert: true },
      );
      charInserted++;
    } catch (e: any) {
      if (e.code === 11000) {
        charSkipped++;
      } else {
        throw e;
      }
    }
  }
  console.log(`characters: 导入 ${charInserted} 条，跳过 ${charSkipped} 条`);

  // === Libraries ===
  const libCollection = db.collection('libraries');
  if (DROP) {
    await libCollection.deleteMany({});
    console.log('已清空 libraries 集合');
  }

  const library: any = JSON.parse(fs.readFileSync(LIBRARY_PATH, 'utf-8'));
  await libCollection.updateOne(
    { _id: library._id },
    { $set: library },
    { upsert: true },
  );
  console.log(`libraries: 导入 "${library.name}" (${library._id})`);

  // 创建索引
  await charsCollection.createIndex({ pinyin: 1 });
  await charsCollection.createIndex({ char_type: 1 });
  console.log('索引创建完成');

  await mongoose.disconnect();
  console.log('种子数据导入完成！');
}

seed().catch((err) => {
  console.error('种子脚本执行失败:', err);
  process.exit(1);
});
