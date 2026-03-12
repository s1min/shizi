/**
 * 生成字库编排文件
 * 读取原始字表，生成符合 product_prototype.md 6.3.2 Schema 的 libraries JSON
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const RAW_PATH = path.join(ROOT, 'resources/raw/grade_1_upper_chars.json');
const OUTPUT_PATH = path.join(ROOT, 'resources/data/lib_1a_upper.json');

function build() {
  const raw = JSON.parse(fs.readFileSync(RAW_PATH, 'utf8'));

  // 统计总字数（去重）
  const allChars = new Set();
  raw.stages.forEach(s => s.units.forEach(u => {
    u.read_chars.forEach(c => allChars.add(c));
  }));

  const library = {
    _id: "lib_1a_upper",
    name: "一年级上册",
    type: "textbook_sync",
    description: "人教版部编版一年级上册识字表同步",
    target_age: "6岁",
    total_chars: allChars.size,
    stages: raw.stages.map(stage => ({
      id: stage.id,
      name: stage.name,
      units: stage.units.map(unit => ({
        id: unit.id,
        name: unit.name,
        lesson: unit.lesson || unit.name,
        chars: unit.read_chars
      }))
    }))
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(library, null, 2), 'utf8');
  console.log(`✅ 生成完成: ${library.total_chars} 个汉字, ${library.stages.length} 个阶段 → ${OUTPUT_PATH}`);
}

build();
