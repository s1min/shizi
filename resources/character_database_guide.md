# 小学 1-3 年级字库构建指南

要制作一套高质量的、符合教育部标准的字库，您需要从**数据源获取**、**数据结构设计**、**数据填充**三个方面入手。

---

## 1. 核心数据源 (Standard Source)

根据教育部颁布的《义务教育语文课程标准》，小学 1-3 年级的识字量要求如下（通常以**部编版/人教版**教材为准）：

*   **一年级**：
    *   识字表（会认）：约 700 字
    *   写字表（会写）：约 300 字
*   **二年级**：
    *   识字表（会认）：约 1100 字（累计 1800）
    *   写字表（会写）：约 500 字（累计 800）
*   **三年级**：
    *   识字表（会认）：约 700 字（累计 2500）
    *   写字表（会写）：约 500 字（累计 1300）

**获取途径**：
1.  **Github 开源库**：搜索 `chinese-xinhua` 或 `pinyin-data` 等开源项目，可以获得汉字的基础信息（拼音、笔画、部首）。
2.  **教育部/教材官网**：下载电子版课本，提取生字表。
3.  **OCR 扫描**：直接购买实体字帖进行 OCR 扫描整理（工作量较大）。

---

## 2. 数据库结构设计 (Schema Design)

为了支撑“趣字宝”的**字源动画**、**跟读打分**、**魔法造句**等功能，您的 JSON 数据结构需要包含以下字段：

### 2.1 基础信息 (Basic Info)
```json
{
  "char": "火",                // 汉字本身
  "pinyin": "huǒ",             // 拼音（带声调）
  "pinyin_tone": 3,            // 声调数值（方便程序处理）
  "definition": "燃烧，物质燃烧时发出的光和热。", // 简明释义
  "strokes": 4,                // 笔画数
  "radicals": "火",            // 部首
  "grade": 1,                  // 年级（1=一年级, 2=二年级...）
  "term": 1,                   // 学期（1=上册, 2=下册）
  "type": "read_write"         // 类型：read_only (只识), read_write (识+写)
}
```

### 2.2 教学资源 (Media Assets)
这部分是产品的核心壁垒，需要链接到您的 OSS/云存储地址。
```json
{
  "assets": {
    "audio_url": "https://oss.quzibao.com/audio/huo3.mp3",       // 标准读音
    "origin_img_url": "https://oss.quzibao.com/origin/huo.png",  // 字源图（象形）
    "stroke_anim_url": "https://oss.quzibao.com/stroke/huo.json",// 笔顺动画（Lottie/SVG）
    "writing_guide_url": "https://oss.quzibao.com/guide/huo.png" // 描红底图
  }
}
```

### 2.3 扩展信息 (Extensions) - 用于 AI 造句
```json
{
  "ai_context": {
    "tags": ["自然", "热", "危险"], // 标签，方便 AI 理解属性
    "common_words": ["着火", "火苗", "大火"], // 常用词，用于生成简单的句子
    "antonyms": ["水"] // 反义词
  }
}
```

---

## 3. 数据采集与清洗流程 (Pipeline)

### 第一步：建立基础字表 (Skeleton)
创建一个 Excel 表格，按照教材目录，录入所有生字。
*   列 A：汉字
*   列 B：年级 (1-3)
*   列 C：类型 (识/写)

### 第二步：批量填充属性 (Enrichment)
写一个简单的 Node.js 脚本，调用开源库（如 `pinyin`）或 API，自动填充拼音、笔画、部首等基础信息。

### 第三步：手动/AI 补全资源 (Assets Generation)
这是最耗时的一步。
*   **字源图**：使用 Midjourney 生成或购买素材。
*   **笔顺数据**：可以使用开源的 `HanziWriter` 数据格式。
*   **释义**：调用 LLM (通义千问) 批量生成适合儿童的简明释义。

---

## 4. 推荐开源工具
*   **HanziWriter**: [https://hanziwriter.org/](https://hanziwriter.org/) - 极其强大的 Web 端汉字笔顺动画库，提供 SVG 数据。
*   **MakeMeHanzi**: [https://github.com/skishore/makemehanzi](https://github.com/skishore/makemehanzi) - 包含大量汉字的矢量笔顺数据。
*   **pinyin-pro**: [https://github.com/zh-lx/pinyin-pro](https://github.com/zh-lx/pinyin-pro) - 专业且轻量的 JS 拼音库。
