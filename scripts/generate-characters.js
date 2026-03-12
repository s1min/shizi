/**
 * 汉字数据生成脚本
 * 合并 makemeahanzi 基础数据 + pinyin-pro 拼音 + 教学数据
 * 输出符合 product_prototype.md 6.3.1 Schema 的 characters.json
 */
const fs = require('fs');
const path = require('path');
const { pinyin } = require('pinyin-pro');

const ROOT = path.resolve(__dirname, '..');
const RAW_PATH = path.join(ROOT, 'resources/raw/grade_1_upper_chars.json');
const DICT_PATH = path.join(ROOT, 'resources/makemeahanzi/dictionary.txt');
const GRAPHICS_PATH = path.join(ROOT, 'resources/makemeahanzi/graphics.txt');
const OUTPUT_PATH = path.join(ROOT, 'resources/data/characters.json');

// ========== 加载 makemeahanzi 数据 ==========
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

// ========== 获取去重汉字列表 ==========
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

// ========== 教学数据映射表 ==========
// 由 AI 生成，包含 char_type、similar_chars、example_words、example_sentences、teaching
const TEACHING_DATA = require('./teaching-data.js');

// ========== 主函数 ==========
function generate() {
  const { dict, graphics } = loadMakemeahanzi();
  const chars = getUniqueChars();
  const result = [];

  for (const char of chars) {
    const d = dict[char];
    const g = graphics[char];
    const teach = TEACHING_DATA[char];

    if (!d) {
      console.warn(`[WARN] makemeahanzi 中未找到: ${char}`);
      continue;
    }

    // 用 pinyin-pro 获取准确拼音（带声调符号）
    const py = pinyin(char, { toneType: 'symbol', type: 'array' })[0];

    const entry = {
      _id: char,
      pinyin: teach?.pinyin || py,  // 优先使用手动指定的拼音（多音字场景）
      char_type: teach?.char_type || '形声',
      radical: d.radical || '',
      strokes: g ? g.strokes.length : 0,
      stroke_order: g ? g.medians.map((_, i) => i + 1).join('') : '',
      similar_chars: teach?.similar_chars || [],
      example_words: teach?.example_words || [],
      example_sentences: teach?.example_sentences || [],
      teaching: {
        animation_type: teach?.teaching?.animation_type || 'scene',
        ...(teach?.teaching || {}),
        image_asset: null,
        emoji_fallback: teach?.teaching?.emoji_fallback || ''
      }
    };

    // 补充会意字拆解信息
    if (entry.char_type === '会意' && d.decomposition) {
      entry.teaching.decompose_parts = entry.teaching.decompose_parts || [];
      entry.teaching.decompose_desc = entry.teaching.decompose_desc || '';
    }

    result.push(entry);
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2), 'utf8');
  console.log(`✅ 生成完成: ${result.length} 个汉字 → ${OUTPUT_PATH}`);
}

generate();
