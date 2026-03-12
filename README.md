# 🦞👁️ Lobster Eye (龙虾眼)

> 基于 OpenClaw 的本地语义记忆系统 - 隐私优先，数据不出本地

---

## 📖 灵感来源

龙虾的复眼由数千个小眼面组成，每个独立感光，组合成 360° 全景视野。

**我们的记忆系统借鉴了这个理念：**
- 多个记忆分块 → 数千个小眼面
- 语义 + 关键词双维度 → 360° 全景搜索
- 每个 chunk 独立嵌入 → 独立感光
- 混合检索融合 → 组合成像

---

## 🎯 解决什么问题

| 传统 RAG | Lobster Eye |
|----------|-------------|
| 必须精确匹配关键词 | 语义理解，措辞不同也能找到 |
| 中文搜不到英文 | 跨语言搜索 (中英 0.607+) |
| 旧内容与新内容同等权重 | 时间衰减，新记忆优先 |
| 返回多条相似内容 | MMR 去重，结果多样化 |
| 可能上传云端 | 100% 本地运行，隐私安全 |

---

## 🛠️ 技术架构

```
用户查询 → Ollama 嵌入 (Qwen3-0.6B) → 混合检索 (向量 70% + BM25 30%) 
    → 时间衰减 (30 天半衰期) → MMR 去重 → 返回结果
```

**核心组件：**
- **嵌入模型**: Qwen3-0.6B (1024 维，0.6GB)
- **推理引擎**: Ollama (本地运行)
- **向量存储**: SQLite + sqlite-vec
- **全文索引**: FTS5

---

## 📋 快速开始

### 1. 下载模型

```bash
ollama pull qwen3-embedding:0.6b
```

### 2. 配置 OpenClaw

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
        "query": {
          "hybrid": {
            "enabled": true,
            "vectorWeight": 0.7,
            "textWeight": 0.3,
            "mmr": { "enabled": true, "lambda": 0.7 },
            "temporalDecay": { "enabled": true, "halfLifeDays": 30 }
          }
        }
      }
    }
  }
}
```

### 3. 重启

```bash
openclaw gateway restart
```

---

## 🧪 测试结果

| 查询 | 语言 | 相关性 | 说明 |
|------|------|--------|------|
| "质谱仪配置" | 中文 | 0.599 | 中文记忆 |
| "mass spec" | 英文 | 0.607 | **跨语言匹配** |
| "RAG 方案" | 中文 | 0.580 | 语义匹配 |

**性能：**
- 首次查询：~1 秒
- 缓存命中：~100ms

---

## 🔒 隐私保护

**数据流向：**
```
用户查询 → 本地 Ollama → 本地 SQLite → 返回结果
         (不出本地)    (不出本地)
```

**备份建议：**
```bash
# 本地加密备份
restic backup --repo ~/backups/memory/restic \
  ~/.openclaw/workspace/memory/

# 或离线备份
tar -czf backup.tar.gz ~/.openclaw/workspace/memory/
gpg -c backup.tar.gz
```

**不要做：**
```bash
# ❌ 绝对不要推送到 Git
git add memory/
git push  # 敏感数据泄露！
```

---

## 📊 对比

| 特性 | Lobster Eye | 传统 RAG | 云端方案 |
|------|-------------|----------|----------|
| 本地运行 | ✅ | ⚠️ | ❌ |
| 跨语言 | ✅ | ⚠️ | ✅ |
| 时间衰减 | ✅ | ❌ | ❌ |
| 去重 | ✅ | ❌ | ❌ |
| 隐私 | ✅ | ✅ | ❌ |
| 成本 | 免费 | 免费 | 按量付费 |

---

## 🚀 下一步

- [ ] 批量嵌入优化
- [ ] 图谱式记忆关联
- [ ] 自动摘要生成

---

**许可证**: MIT  
**最后更新**: 2026-03-13
