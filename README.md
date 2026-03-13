# 🦞👁️ Lobster Eye (龙虾眼)

> OpenClaw 记忆系统的本地化增强方案 - 隐私优先，数据不出本地

**基于 OpenClaw 原生记忆系统 + Lobster Chunker + Ollama 本地 Embedding**

**运行环境：** WSL2 + OpenClaw + Ollama

---

## 📌 项目定位

**Lobster Eye = OpenClaw 原生记忆系统 + 本地化增强**

| 组件 | 来源 | 说明 |
|------|------|------|
| **Embedding 搜索** | OpenClaw 原生 | SQLite + sqlite-vec |
| **混合检索** | OpenClaw 原生 | 向量 + BM25 |
| **时间衰减** | OpenClaw 原生 | 30 天半衰期 |
| **MMR 去重** | OpenClaw 原生 | 多样性平衡 |
| **Lobster Chunker** | 🆕 龙虾眼 | Markdown 结构感知分块 |
| **Ollama 本地化** | 🆕 龙虾眼 | 隐私优先 + 性能优化 |

---

## 📖 灵感来源

龙虾的复眼由数千个小眼面组成，每个独立感光，组合成 360° 全景视野。

**我们的记忆系统借鉴了这个理念：**
- 多个记忆分块 → 数千个小眼面
- 语义 + 关键词双维度 → 360° 全景搜索
- 每个 chunk 独立嵌入 → 独立感光
- 混合检索融合 → 组合成像

---

## 🎯 期望解决的问题

### OpenClaw 原生记忆系统的痛点

| 痛点 | 表现 | 后果 |
|------|------|------|
| **搜索慢** | 全文扫描，无索引 | 大量记忆时查询超时 |
| **无语义理解** | 必须精确匹配关键词 | 找不到语义相同但措辞不同的内容 |
| **跨语言不行** | 中文搜不到英文 | 多语言用户效率极低 |
| **无时间感知** | 旧内容与新内容同等权重 | 近期重要信息被淹没 |
| **结果重复** | 返回多条相似内容 | 浪费注意力 |

### 常见使用场景

**你是否有过这样的经历：**

❌ 记得写过"项目会议记录"，但搜"开会"找不到  
❌ 记得存过"API 密钥"，但搜"password"找不到  
❌ 记得昨天写的笔记，但被几个月前的旧内容淹没  
❌ 搜"周报"返回 5 条几乎相同的内容  

**Lobster Eye 就是为了解决这些问题！**

---

## 🛠️ 技术架构

**龙虾眼使用 OpenClaw 原生记忆系统架构，仅在以下方面增强：**

1. **Embedding Provider**: Ollama 本地模型 (vs 云端 API)
2. **Lobster Chunker**: Markdown 结构感知分块 (vs 固定长度)
3. **性能优化**: keep_alive 永久加载 (vs 默认 5 分钟)

**其他组件 (混合检索/时间衰减/MMR 去重) 均为 OpenClaw 原生功能。**

---

## ⚡ Ollama 本地化优化

**OpenClaw 原生支持 Ollama Embedding，龙虾眼补充性能优化方案：**

### 方案 1: WSL2 端设置 (推荐)

在 `~/.bashrc` 中添加：
```bash
curl -s -X POST http://localhost:11434/api/embeddings \
  -d '{"model": "qwen3-embedding:0.6b", "prompt": "warmup", "keep_alive": -1}' > /dev/null &
```

### 方案 2: Windows 端设置 (完全解决)

Windows 环境变量：`OLLAMA_KEEP_ALIVE=-1`

**效果：** 响应时间从 4 秒 → 0.2 秒 (20 倍提升)

---

## 📋 详细构建步骤

### 环境准备

**前置要求：**
- OpenClaw Gateway (WSL2)
- Ollama (Windows 或 WSL2)
- 至少 1GB 磁盘空间

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

---

## 🧪 测试结果

### 跨语言搜索测试

| 查询 | 语言 | 相关性 | 说明 |
|------|------|--------|------|
| "项目会议" | 中文 | 0.599 | 中文记忆 |
| "meeting notes" | 英文 | 0.607 | 跨语言匹配 |
| "weekly report" | 英文 | 0.584 | 跨语言匹配 |

### 性能测试

| 操作 | 耗时 |
|------|------|
| Ollama Embedding (优化后) | ~0.2 秒 |
| 向量搜索 | ~50ms |
| BM25 搜索 | ~20ms |
| **总计** | **~0.3 秒** |

---

## 🔒 备份策略

**使用 OpenClaw 官方备份命令：**

```bash
# 创建备份并验证
openclaw backup create --verify

# 只备份配置 (不含工作区)
openclaw backup create --only-config
```

**注意：** 记忆文件包含敏感信息，不建议推送到 Git！

---

## 📊 与其他方案对比

| 特性 | Lobster Eye | 传统 RAG | 云端方案 |
|------|-------------|----------|----------|
| **本地运行** | ✅ | ⚠️ | ❌ |
| **跨语言** | ✅ | ⚠️ | ✅ |
| **时间衰减** | ✅ | ❌ | ❌ |
| **去重** | ✅ | ❌ | ❌ |
| **隐私保护** | ✅ | ✅ | ❌ |
| **成本** | 免费 | 免费 | 按量付费 |

---

## 📚 参考资料

- [OpenClaw 文档](https://docs.openclaw.ai/concepts/memory)
- [Ollama](https://ollama.com)
- [Qwen3 Embedding](https://ollama.com/library/qwen3-embedding)
- [SQLite FTS5](https://www.sqlite.org/fts5.html)

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
