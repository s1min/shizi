const fs = require('fs');
const { pinyin } = require('./node_modules/pinyin-pro');

const ROOT = __dirname + '/..';
const dict = {};
fs.readFileSync(ROOT + '/resources/makemeahanzi/dictionary.txt', 'utf8').split('\n').filter(Boolean).forEach(line => {
  const d = JSON.parse(line); dict[d.character] = d;
});
const graphics = {};
fs.readFileSync(ROOT + '/resources/makemeahanzi/graphics.txt', 'utf8').split('\n').filter(Boolean).forEach(line => {
  const g = JSON.parse(line); graphics[g.character] = g;
});

const raw = JSON.parse(fs.readFileSync(ROOT + '/resources/raw/grade_1_upper_chars.json', 'utf8'));
const chars = [];
raw.stages.forEach(s => s.units.forEach(u => u.read_chars.forEach(c => {
  if (!chars.includes(c)) chars.push(c);
})));

const types = {};
chars.forEach(c => {
  const t = dict[c]?.etymology?.type || 'unknown';
  types[t] = (types[t] || 0) + 1;
});
console.log('etymology_type 分布:', JSON.stringify(types));
console.log('总字数:', chars.length);

// 打印所有字的基础信息
chars.forEach(c => {
  const d = dict[c] || {};
  const g = graphics[c] || {};
  const py = pinyin(c, { toneType: 'symbol', type: 'array' })[0];
  console.log(`${c}\t${py}\t${d.radical || ''}\t${g.strokes ? g.strokes.length : 0}\t${d.etymology?.type || ''}\t${d.decomposition || ''}`);
});
