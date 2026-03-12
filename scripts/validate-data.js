/**
 * 数据校验脚本
 * 检查 characters.json 和 libraries JSON 的数据完整性
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CHARS_PATH = path.join(ROOT, 'resources/data/characters.json');
const LIB_PATH = path.join(ROOT, 'resources/data/lib_1a_upper.json');

let errors = 0;
let warnings = 0;

function error(msg) {
  console.error(`❌ ERROR: ${msg}`);
  errors++;
}

function warn(msg) {
  console.warn(`⚠️  WARN: ${msg}`);
  warnings++;
}

function info(msg) {
  console.log(`ℹ️  ${msg}`);
}

function validate() {
  console.log('=== 汉字数据校验 ===\n');

  // 1. 加载数据
  if (!fs.existsSync(CHARS_PATH)) {
    error(`characters.json 不存在: ${CHARS_PATH}`);
    return;
  }
  if (!fs.existsSync(LIB_PATH)) {
    error(`lib_1a_upper.json 不存在: ${LIB_PATH}`);
    return;
  }

  const characters = JSON.parse(fs.readFileSync(CHARS_PATH, 'utf8'));
  const library = JSON.parse(fs.readFileSync(LIB_PATH, 'utf8'));

  info(`characters.json: ${characters.length} 个汉字`);
  info(`lib_1a_upper.json: ${library.stages.length} 个阶段, ${library.total_chars} 个汉字`);
  console.log();

  // 2. 构建字符集
  const charSet = new Set(characters.map(c => c._id));

  // 3. 检查 characters.json 必填字段
  console.log('--- 检查 characters.json 字段完整性 ---');
  const requiredFields = ['_id', 'pinyin', 'char_type', 'radical', 'strokes'];
  const teachingFields = ['animation_type', 'emoji_fallback'];

  characters.forEach(char => {
    requiredFields.forEach(field => {
      if (!char[field] && char[field] !== 0) {
        error(`字 "${char._id}" 缺少必填字段: ${field}`);
      }
    });

    // 检查 strokes 是数字且 > 0
    if (typeof char.strokes !== 'number' || char.strokes <= 0) {
      error(`字 "${char._id}" 的 strokes 无效: ${char.strokes}`);
    }

    // 检查 char_type 是有效值
    const validTypes = ['象形', '会意', '形声', '指事', '抽象'];
    if (!validTypes.includes(char.char_type)) {
      warn(`字 "${char._id}" 的 char_type 非标准值: ${char.char_type}`);
    }

    // 检查 teaching 字段
    if (!char.teaching) {
      warn(`字 "${char._id}" 缺少 teaching 对象`);
    } else {
      teachingFields.forEach(field => {
        if (!char.teaching[field]) {
          warn(`字 "${char._id}" 的 teaching 缺少: ${field}`);
        }
      });
    }

    // 检查 similar_chars 和 example_words 非空
    if (!char.similar_chars || char.similar_chars.length === 0) {
      warn(`字 "${char._id}" 缺少 similar_chars`);
    }
    if (!char.example_words || char.example_words.length === 0) {
      warn(`字 "${char._id}" 缺少 example_words`);
    }
  });

  // 4. 检查拼音格式（应包含声调符号）
  console.log('\n--- 检查拼音格式 ---');
  const toneMarks = /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/;
  let pinyinIssues = [];
  characters.forEach(char => {
    if (!toneMarks.test(char.pinyin) && char.pinyin !== 'de' && char.pinyin !== 'le') {
      pinyinIssues.push(char._id);
    }
  });
  if (pinyinIssues.length > 0) {
    warn(`${pinyinIssues.length} 个字的拼音可能缺少声调: ${pinyinIssues.slice(0, 10).join('')}...`);
  } else {
    info('所有拼音格式正确');
  }

  // 5. 检查字库引用完整性
  console.log('\n--- 检查字库引用完整性 ---');
  const libChars = new Set();
  library.stages.forEach(stage => {
    stage.units.forEach(unit => {
      unit.chars.forEach(c => {
        libChars.add(c);
        if (!charSet.has(c)) {
          error(`字库引用的字 "${c}" 在 characters.json 中不存在 (${stage.name} / ${unit.name})`);
        }
      });
    });
  });
  info(`字库引用 ${libChars.size} 个唯一汉字`);

  // 6. 检查是否有 characters 中未被字库引用的字
  const unusedChars = characters.filter(c => !libChars.has(c._id));
  if (unusedChars.length > 0) {
    warn(`${unusedChars.length} 个字在 characters.json 中但未被字库引用: ${unusedChars.map(c => c._id).join('')}`);
  }

  // 7. 检查重复
  console.log('\n--- 检查重复 ---');
  const ids = characters.map(c => c._id);
  const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (duplicates.length > 0) {
    error(`characters.json 中有重复的字: ${[...new Set(duplicates)].join('')}`);
  } else {
    info('无重复汉字');
  }

  // 8. 结果汇总
  console.log('\n=== 校验结果 ===');
  if (errors === 0 && warnings === 0) {
    console.log('✅ 全部通过！数据质量良好。');
  } else {
    console.log(`❌ ${errors} 个错误, ⚠️  ${warnings} 个警告`);
  }

  process.exit(errors > 0 ? 1 : 0);
}

validate();
