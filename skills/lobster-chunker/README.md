# 🦞 Lobster Chunker

**Markdown 结构感知分块器** - 为龙虾眼记忆系统优化

---

## 📖 来源说明

**基于 [easy-dataset](https://github.com/ConardLi/easy-dataset) (13.6k Stars) 的 Markdown 分块算法改写**，针对 OpenClaw 龙虾眼记忆系统简化和优化。

**改写内容：**
- 简化了原有的复杂逻辑
- 适配 OpenClaw 的 memorySearch 接口
- 保持了核心的"按标题层级分割"和"智能合并小段落"算法

---

## ✨ 特性

1. **按标题层级分割** - 保持文档结构完整
2. **智能合并小段落** - 避免碎片化（<1500 字自动合并）
3. **递归分割超长段落** - 段落 > 句子 > 固定长度
4. **参数可配置** - minLength / maxLength 可调

---

## 🚀 快速开始

### 安装

```bash
cd ~/.openclaw/workspace/skills/lobster-chunker
npm install  # 无依赖，纯 JS
```

### 使用

```javascript
const { chunkMarkdown } = require('./chunker');

const markdown = `
# 标题 1
内容...

## 标题 2
更多内容...
`;

const chunks = chunkMarkdown(markdown, {
  minLength: 1500,
  maxLength: 2000
});

console.log(chunks);
// 输出：
// [
//   {
//     heading: "标题 1",
//     level: 1,
//     content: "内容...",
//     chunkIndex: 0,
//     totalChunks: 1
//   }
// ]
```

### 测试

```bash
npm test
```

---

## 📊 API

### `chunkMarkdown(markdown, options)`

**参数：**
- `markdown` (string): Markdown 文本
- `options` (object): 配置选项
  - `minLength` (number): 最小长度，默认 1500
  - `maxLength` (number): 最大长度，默认 2000

**返回：**
- `Array`: 分块数组
  - `heading` (string|null): 标题
  - `level` (number): 标题层级 (1-6)
  - `content` (string): 内容
  - `chunkIndex` (number): 块索引
  - `totalChunks` (number): 总块数

---

## 🎯 算法流程

```
Markdown 输入
    ↓
1. 解析大纲 (extractOutline)
   - 提取所有标题 (# ## ### ...)
    ↓
2. 按标题分割 (splitByHeadings)
   - 每个标题及其内容作为一个块
    ↓
3. 处理段落 (processSections)
   - 合并小段落 (< minLength)
   - 分割超长段落 (> maxLength)
    ↓
4. 返回分块数组
```

---

## 📈 对比

| 特性 | 传统分块 | Lobster Chunker |
|------|----------|-----------------|
| 保持标题结构 | ❌ | ✅ |
| 智能合并小段落 | ❌ | ✅ |
| 递归分割 | ❌ | ✅ (段落>句子>长度) |
| 参数可调 | ✅ | ✅ |

---

## 🔧 集成到 OpenClaw

修改 `~/.openclaw/openclaw.json`:

```json5
{
  "agents": {
    "defaults": {
      "memorySearch": {
        "chunking": {
          "strategy": "markdown-aware",
          "minLength": 1500,
          "maxLength": 2000
        }
      }
    }
  }
}
```

---

## 📄 许可证

MIT License

---

**版本**: 1.0.0  
**最后更新**: 2026-03-13  
**作者**: @henserlu
