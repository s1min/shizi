<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

## Frontend spacing rule

- 除字体相关数值外，主要对宽度、高度、内外边距、间距等布局尺寸进行约束：这类数值必须使用 4 的倍数或 8 的倍数。
- 适用范围主要包括但不限于：width、height、min/max-width、min/max-height、padding、margin、gap、top/right/bottom/left、translate 位移、定位偏移等。
- 默认优先选择 8 的倍数；需要更细颗粒度时使用 4 的倍数。
- 边框、阴影、描边、透明度、渐变停靠点等特殊视觉细节不受这条规则限制。
- 若发现现有样式不符合该规则，在改动相关布局区域时应顺手统一到该规则。

## Frontend UI rules

### 1. General principles
- 所有页面先识别 **主任务、辅助信息、推进动作**，再写样式。
- 每个页面只能有 **一个主视觉中心**。
- 装饰必须服务于任务表达；不能帮助分组、强调主任务或表达状态的装饰，应删除。
- 同一学习流程中的页面应保持统一的按钮、卡片、状态、文字层级和留白节奏。

### 2. Layout and spacing
- 除字体相关数值外，**宽度、高度、内外边距、间距、定位偏移、位移** 等布局尺寸必须使用 **4 的倍数或 8 的倍数**。
- 默认优先使用 **8 的倍数**；需要更细颗粒度时使用 **4 的倍数**。
- 这条规则适用于：`width`、`height`、`min/max-width`、`min/max-height`、`padding`、`margin`、`gap`、`top/right/bottom/left`、`translate` 等。
- **边框、阴影、描边、透明度、渐变停靠点等视觉细节不受此规则限制。**
- 页面外层留白、模块间距、组件内间距必须形成明确层级：**模块间距大于组件内间距**。

### 3. Container rules
- 容器只分为三类：**裸容器、轻卡片、强调卡片**。
- 优先使用裸容器；只有在需要表达分组时才使用轻卡片；只有在需要强调状态或结果时才使用强调卡片。
- 避免一层内容外再叠多层无意义卡片、描边或阴影。
- 同一页面内的圆角档位应控制在少数几档内，不要为每个模块单独发明一套圆角。

### 4. Button rules
- 按钮只分为三类：**主按钮、次按钮、图标按钮**。
- 主按钮用于推进操作；次按钮用于回退或次级操作；图标按钮用于简单工具动作，如播放声音。
- 同类按钮必须复用相同的尺寸体系、圆角体系和状态表达。
- 页面底部的主按钮和次按钮必须同高、同圆角、同一排布逻辑。
- 同语义的图标按钮必须使用同一套视觉语言，只允许主次尺寸不同，不允许风格漂移。

### 5. Typography rules
- 文字层级只保留：**页面主标题、模块标题、核心内容、正文说明、辅助文字** 五层。
- 一个区域只能有一个主文字；说明文案不能抢主任务注意力。
- 说明文案优先使用短句；一条文案只表达一件事。
- 不要在同一页面中滥用高字重；标题、主操作、主内容与辅助文字必须拉开层级。

### 6. Color and state rules
- 颜色按角色使用，而不是按感觉堆砌：**主品牌色、辅助中性色、状态色**。
- 状态语义统一为：**default / current / done / success / error / disabled**。
- 同一语义在不同组件中必须保持一致表达，不允许一个地方用黄色表示当前，另一个地方用蓝色表示当前。
- 禁用态不是错误态；禁用态应降低对比和饱和度，但保留结构可见性。

### 7. Card and option-item rules
- 所有“可选项”都应视为统一的题目项组件，而不是每个页面单独设计。
- 题目项结构应稳定，通常只包含：**功能区、主内容区、状态表达**。
- 题组卡片只是分组容器，不能抢主内容注意力。
- 默认态轻，选中态明确，正确/错误状态清晰，但不要把题目项做得比主任务区更重。

### 8. Feedback rules
- 反馈必须 **短、轻、明确**。
- 正确反馈用于确认成功；错误反馈用于引导继续；禁用/流程反馈用于解释当前不可操作原因。
- 错误反馈应偏引导，不应强调惩罚感，尤其在儿童产品中。
- 反馈卡的视觉权重不得高于主任务区和题目项主体。

### 9. Implementation rule
- 修改任何前端区域时，不只修当前问题，也应顺手把该区域统一到这套规则。
- 如果一个页面需要大量例外样式，优先反思页面是否偏离了这套规则，而不是继续增加特例。
