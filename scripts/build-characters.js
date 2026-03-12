/**
 * 汉字数据构建脚本
 * 合并 makemeahanzi 基础数据 + pinyin-pro + 教学数据
 */
const fs = require('fs');
const path = require('path');
const { pinyin } = require('./node_modules/pinyin-pro');

const ROOT = path.resolve(__dirname, '..');
const DICT_PATH = path.join(ROOT, 'resources/makemeahanzi/dictionary.txt');
const GRAPHICS_PATH = path.join(ROOT, 'resources/makemeahanzi/graphics.txt');
const RAW_PATH = path.join(ROOT, 'resources/raw/grade_1_upper_chars.json');
const TEACHING_DIR = path.join(__dirname, 'teaching-data');
const OUTPUT_PATH = path.join(ROOT, 'resources/data/characters.json');

// 加载 makemeahanzi 数据
function loadMakemeahanzi() {
  const dict = {};
  const graphics = {};

  fs.readFileSync(DICT_PATH, 'utf8').split('\n').filter(Boolean).forEach(line => {
    const d = JSON.parse(line);
    dict[d.character] = d;
  });

  fs.readFileSync(GRAPHICS_PATH, 'utf8').split('\n').filter(Boolean).forEach(line => {
    const g = JSON.parse(line);
    graphics[g.character] = g;
  });

  return { dict, graphics };
}

// 获取去重字表
function getUniqueChars() {
  const raw = JSON.parse(fs.readFileSync(RAW_PATH, 'utf8'));
  const chars = [];
  raw.stages.forEach(s => s.units.forEach(u => {
    u.read_chars.forEach(c => {
      if (!chars.includes(c)) chars.push(c);
    });
  }));
  return chars;
}

// 加载所有教学数据
function loadTeachingData() {
  const teaching = {};
  if (!fs.existsSync(TEACHING_DIR)) return teaching;

  const files = fs.readdirSync(TEACHING_DIR).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(TEACHING_DIR, file), 'utf8'));
    Object.assign(teaching, data);
  }
  return teaching;
}

// etymology.type 到 char_type 的映射
function mapCharType(etymologyType) {
  const map = {
    'pictographic': '象形',
    'ideographic': '会意',
    'pictophonetic': '形声'
  };
  return map[etymologyType] || '形声';
}

// 主函数
function build() {
  const { dict, graphics } = loadMakemeahanzi();
  const chars = getUniqueChars();
  const teaching = loadTeachingData();
  const result = [];

  for (const char of chars) {
    const d = dict[char] || {};
    const g = graphics[char] || {};
    const t = teaching[char] || {};

    // pinyin-pro 获取拼音
    const py = pinyin(char, { toneType: 'symbol', type: 'array' })[0];

    // 基础 char_type 从 makemeahanzi etymology 推断，教学数据可覆盖
    const baseCharType = d.etymology?.type ? mapCharType(d.etymology.type) : '形声';

    const entry = {
      _id: char,
      pinyin: t.pinyin || py,
      char_type: t.char_type || baseCharType,
      radical: d.radical || '',
      strokes: g.strokes ? g.strokes.length : 0,
      stroke_order: g.medians ? g.medians.map((_, i) => i + 1).join('') : '',
      stroke_paths: g.strokes || [],
      stroke_medians: g.medians || [],
      similar_chars: t.similar_chars || [],
      example_words: t.example_words || [],
      example_sentences: t.example_sentences || [],
      teaching: {
        animation_type: t.teaching?.animation_type || 'scene',
        ...(t.teaching || {}),
        image_asset: null,
        emoji_fallback: t.teaching?.emoji_fallback || ''
      }
    };

    result.push(entry);
  }

  const json = JSON.stringify(result, null, 2);
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, json, 'utf8');

  // 同步到前端
  const FRONTEND_PATH = path.join(ROOT, 'shizi-frontend/src/data/characters.json');
  fs.mkdirSync(path.dirname(FRONTEND_PATH), { recursive: true });
  fs.writeFileSync(FRONTEND_PATH, json, 'utf8');

  console.log(`✅ 生成完成: ${result.length} 个汉字`);
  console.log(`   → ${OUTPUT_PATH}`);
  console.log(`   → ${FRONTEND_PATH}`);
}

build();
