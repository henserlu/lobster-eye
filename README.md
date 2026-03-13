# 🦞👁️ Lobster Eye (龙虾眼)

> OpenClaw 记忆系统的本地化增强方案

**核心贡献：数据安全 + 智能分块**

**运行环境：** WSL2 + OpenClaw + Ollama

---

## 📌 项目定位

**Lobster Eye = OpenClaw 原生记忆系统 + 本地化增强**

OpenClaw 原生记忆系统功能完整，龙虾眼提供两种增强：

| 增强项 | OpenClaw 默认 | 龙虾眼方案 | 价值 |
|--------|-------------|------------|------|
| **Embedding Provider** | 云端 API (OpenAI/Gemini 等) | **本地 Ollama** | 数据不出本地 |
| **分块算法** | 固定长度 | **Markdown 感知** | 保持文档结构 |

**其他功能 (混合检索/时间衰减/MMR 去重/SQLite 存储) 均使用 OpenClaw 原生。**

---

## 🛡️ 数据安全

### 为什么选择本地 Embedding？

**云端 API 的顾虑：**
- ❌ 记忆内容发送到第三方服务器
- ❌ 可能包含敏感信息 (会议记录/API 密钥/个人笔记)
- ❌ 依赖网络连接

**龙虾眼方案：**
- ✅ Ollama 本地运行
- ✅ 数据不出 WSL2
- ✅ 无需网络

### Ollama 配置

**步骤 1: 下载模型**
```bash
ollama pull qwen3-embedding:0.6b
```

**步骤 2: 配置 OpenClaw**

编辑 `~/.openclaw/openclaw.json`：
```json5
{
  "agents": {
    "defaults": {
      "memorySearch": {
        "enabled": true,
        "provider": "ollama",
        "model": "qwen3-embedding:0.6b",
        "remote": {
          "baseUrl": "http://localhost:11434",
          "apiKey": "ollama-local"
        }
      }
    }
  }
}
```

**步骤 3: 性能优化**

在 `~/.bashrc` 中添加：
```bash
# 永久保持模型加载 (响应时间 4 秒 → 0.2 秒)
curl -s -X POST http://localhost:11434/api/embeddings \
  -d '{"model": "qwen3-embedding:0.6b", "prompt": "warmup", "keep_alive": -1}' > /dev/null &
```

---

## 🧩 Lobster Chunker - Markdown 结构感知分块

### 为什么需要智能分块？

**固定长度分块的问题：**
```
# 会议记录

## 上午工作

讨论了这个项目的进度...[被切断]

## 下午工作

[从中间开始] 继续讨论...
```

**Lobster Chunker 的做法：**
```
Chunk 1: # 会议记录 + ## 上午工作 (完整)
Chunk 2: ## 下午工作 (完整)
```

### 分块算法

```
Markdown 输入
    ↓
1️⃣ 解析大纲 (提取标题层级)
    ↓
2️⃣ 按标题分割 (保持结构完整)
    ↓
3️⃣ 处理段落
   ├─ 合并小段落 (<1500 字)
   └─ 分割超长段落 (>2000 字)
    ↓
4️⃣ 输出分块数组
```

**性能：** ~1ms / 10000 字符

### 使用 Lobster Chunker

```javascript
const { chunkMarkdown } = require('./skills/lobster-chunker/chunker.js');

const chunks = chunkMarkdown(markdown, {
  minLength: 1500,
  maxLength: 2000
});
```

---

## 📋 完整配置步骤

### 环境准备

- WSL2 (运行 OpenClaw)
- Ollama (Windows 或 WSL2)
- OpenClaw Gateway

### 步骤 1: 下载 Embedding 模型

```bash
ollama pull qwen3-embedding:0.6b
```

### 步骤 2: 配置 OpenClaw

编辑 `~/.openclaw/openclaw.json`：
```json5
{
  "agents": {
    "defaults": {
      "memorySearch": {
        "enabled": true,
        "provider": "ollama",
        "model": "qwen3-embedding:0.6b",
        "remote": {
          "baseUrl": "http://localhost:11434",
          "apiKey": "ollama-local"
        },
        "cache": {
          "enabled": true,
          "maxEntries": 50000
        },
        "query": {
          "hybrid": {
            "enabled": true,
            "vectorWeight": 0.7,
            "textWeight": 0.3
          }
        }
      }
    }
  }
}
```

### 步骤 3: 重启 Gateway

```bash
openclaw gateway restart
```

### 步骤 4: 验证

```bash
openclaw memory status
```

---

## 📊 效果对比

### 数据安全

| 方案 | 数据流向 | 隐私风险 |
|------|----------|----------|
| 云端 API | 本地 → 第三方服务器 | ⚠️ 中 |
| 龙虾眼 | 本地 → 本地 | ✅ 无 |

### 分块质量

| 场景 | 固定长度 | Lobster Chunker |
|------|----------|-----------------|
| 有标题文档 | 切断标题 | ✅ 保持结构 |
| 短段落 | 碎片化 | ✅ 智能合并 |
| 超长段落 | 硬切断 | ✅ 递归分割 |

### 性能

| 操作 | 耗时 |
|------|------|
| Ollama Embedding (优化后) | ~0.2 秒 |
| Lobster Chunker | ~1ms/10k 字符 |
| 记忆搜索 | ~0.3 秒 |

---

## 🔒 备份策略

使用 OpenClaw 官方备份命令：

```bash
# 创建备份并验证
openclaw backup create --verify
```

**注意：** 记忆文件包含敏感信息，不建议推送到 Git！

---

## 📚 参考资料

- [OpenClaw 记忆系统文档](https://docs.openclaw.ai/concepts/memory)
- [Ollama](https://ollama.com)
- [Qwen3 Embedding](https://ollama.com/library/qwen3-embedding)

---

## 🙏 致谢

- **[Qwen Team](https://github.com/QwenLM)** - Qwen3-Embedding 模型
- **[easy-dataset](https://github.com/ConardLi/easy-dataset)** - Markdown 分块算法灵感
- **[OpenClaw](https://github.com/openclaw/openclaw)** - 记忆系统框架
- **[Ollama](https://github.com/ollama/ollama)** - 本地推理引擎

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

**注意：** 提交前请确保不包含任何敏感信息。

---

## 📄 许可证

MIT License

---

**最后更新**: 2026-03-13  
**维护者**: @henserlu  
**运行环境**: WSL2 + OpenClaw + Ollama
