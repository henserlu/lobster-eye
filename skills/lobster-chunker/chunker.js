/**
 * 🦞 Lobster Chunker - Markdown 结构感知分块器
 * 
 * 基于 easy-dataset 的灵感，为龙虾眼优化的分块算法
 * 
 * 特性：
 * 1. 按标题层级分割（保持文档结构）
 * 2. 智能合并小段落（避免碎片化）
 * 3. 递归分割超长段落（段落 > 句子 > 固定长度）
 */

/**
 * 解析 Markdown 大纲
 * @param {string} markdown - Markdown 文本
 * @returns {Array} - 大纲数组 [{heading, level, position}]
 */
function extractOutline(markdown) {
  const outline = [];
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  let match;
  
  while ((match = headingRegex.exec(markdown)) !== null) {
    outline.push({
      heading: match[2].trim(),
      level: match[1].length,
      position: match.index
    });
  }
  
  return outline;
}

/**
 * 按标题分割 Markdown 文档
 * @param {string} markdown - Markdown 文本
 * @param {Array} outline - 大纲
 * @returns {Array} - 分块数组 [{heading, level, content, position}]
 */
function splitByHeadings(markdown, outline) {
  const sections = [];
  
  if (outline.length === 0) {
    // 没有标题，整个文档作为一个块
    sections.push({
      heading: null,
      level: 0,
      content: markdown,
      position: 0
    });
    return sections;
  }
  
  for (let i = 0; i < outline.length; i++) {
    const current = outline[i];
    const next = outline[i + 1];
    
    const start = current.position;
    const end = next ? next.position : markdown.length;
    
    // 只取标题后的内容，不包含标题本身（标题单独存储）
    const headingLineEnd = markdown.indexOf('\n', start);
    const contentStart = headingLineEnd !== -1 ? headingLineEnd + 1 : start;
    
    sections.push({
      heading: current.heading,
      level: current.level,
      content: markdown.slice(contentStart, end).trim(),
      position: start
    });
  }
  
  return sections;
}

/**
 * 递归分割超长段落
 * @param {Object} section - 段落对象
 * @param {number} maxLength - 最大长度
 * @returns {Array} - 分割后的段落数组
 */
function splitLongSection(section, maxLength) {
  const content = section.content;
  const result = [];
  
  // 1. 先按段落分割
  const paragraphs = content.split(/\n\n+/);
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    if (paragraph.length > maxLength) {
      // 段落本身超长
      if (currentChunk) {
        result.push(currentChunk);
        currentChunk = '';
      }
      
      // 2. 按句子分割
      const sentences = paragraph.match(/[^.!?。！？]+[.!?。！？]+/g) || [paragraph];
      let sentenceChunk = '';
      
      for (const sentence of sentences) {
        if ((sentenceChunk + sentence).length <= maxLength) {
          sentenceChunk += sentence;
        } else {
          if (sentenceChunk) {
            result.push(sentenceChunk);
          }
          sentenceChunk = sentence;
        }
      }
      
      if (sentenceChunk) {
        currentChunk = sentenceChunk;
      }
    } else if ((currentChunk + '\n\n' + paragraph).length <= maxLength) {
      currentChunk = currentChunk ? currentChunk + '\n\n' + paragraph : paragraph;
    } else {
      result.push(currentChunk);
      currentChunk = paragraph;
    }
  }
  
  if (currentChunk) {
    result.push(currentChunk);
  }
  
  return result;
}

/**
 * 处理段落 - 智能合并小段落 + 分割超长段落
 * @param {Array} sections - 段落数组
 * @param {number} minLength - 最小长度
 * @param {number} maxLength - 最大长度
 * @returns {Array} - 处理后的段落数组
 */
function processSections(sections, minLength, maxLength) {
  const result = [];
  let accumulatedSection = null;
  
  for (const section of sections) {
    const contentLength = section.content.trim().length;
    
    // 小于最小长度，累积
    if (contentLength < minLength) {
      if (!accumulatedSection) {
        accumulatedSection = { ...section };
      } else {
        accumulatedSection.content += `\n\n${section.heading ? `${'#'.repeat(section.level)} ${section.heading}\n` : ''}${section.content}`;
      }
      
      // 累积到足够长度，处理
      if (accumulatedSection.content.trim().length >= minLength) {
        const accumulatedLength = accumulatedSection.content.trim().length;
        
        if (accumulatedLength > maxLength) {
          // 超长，分割
          const subSections = splitLongSection(accumulatedSection, maxLength);
          for (const sub of subSections) {
            result.push({
              heading: accumulatedSection.heading,
              level: accumulatedSection.level,
              content: sub
            });
          }
        } else {
          result.push(accumulatedSection);
        }
        
        accumulatedSection = null;
      }
      continue;
    }
    
    // 处理累积的段落
    if (accumulatedSection) {
      result.push(accumulatedSection);
      accumulatedSection = null;
    }
    
    // 正常段落，检查是否超长
    if (contentLength > maxLength) {
      const subSections = splitLongSection(section, maxLength);
      for (const sub of subSections) {
        result.push({
          heading: section.heading,
          level: section.level,
          content: sub
        });
      }
    } else {
      result.push(section);
    }
  }
  
  // 处理最后累积的段落
  if (accumulatedSection) {
    result.push(accumulatedSection);
  }
  
  return result;
}

/**
 * 主函数：Markdown 结构感知分块
 * @param {string} markdown - Markdown 文本
 * @param {Object} options - 配置选项
 * @param {number} options.minLength - 最小长度 (默认 1500)
 * @param {number} options.maxLength - 最大长度 (默认 2000)
 * @returns {Array} - 分块数组 [{heading, level, content, chunkIndex}]
 */
function chunkMarkdown(markdown, options = {}) {
  const minLength = options.minLength || 1500;
  const maxLength = options.maxLength || 2000;
  
  // 1. 解析大纲
  const outline = extractOutline(markdown);
  
  // 2. 按标题分割
  const sections = splitByHeadings(markdown, outline);
  
  // 3. 处理段落（合并小段落 + 分割超长段落）
  const processedSections = processSections(sections, minLength, maxLength);
  
  // 4. 添加索引
  return processedSections.map((section, index) => ({
    ...section,
    chunkIndex: index,
    totalChunks: processedSections.length
  }));
}

// 导出
module.exports = {
  chunkMarkdown,
  extractOutline,
  splitByHeadings,
  splitLongSection,
  processSections
};
