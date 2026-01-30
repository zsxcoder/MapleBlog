---
title: 在MapleBlog中实现AI摘要功能
description: 详细介绍如何在MapleBlog Astro博客中添加AI摘要功能，包括API配置、代码集成、样式适配和使用方法
createdAt: 2026-01-29
updatedAt: 2026-01-30
categories:
  - 技术
  - 博客优化
tags:
  - Astro
  - AI
  - 前端
  - 博客
status: published
featured: true
recommended: true
hideToc: false
draft: false
ai: true
summary: "文章介绍了如何在MapleBlog中集成AI摘要功能，通过使用星火Spark-LiteAPI生成摘要并存储在文章的frontmatter中，作者详细描述了实现过程，包括API配置、代码集成、样式适配和使用方法，以及如何通过本地生成摘要的方式避免每次访问都请求API的问题，此外，还提供了一些关于如何优化和调试该功能的提示。"
---
## 起因

在魔改MapleBlog时，我发现为文章添加AI摘要可以显著提升用户体验，让读者能够快速了解文章内容。虽然市面上有一些AI摘要服务，但我希望能够完全自定义实现，并且将摘要存储在本地，避免每次访问都请求API。

参考了几位大佬尤其是使用过[梨尽兴](https://blog.ljx.icu/blog/aisummary-blog)的实现思路后，我决定在MapleBlog中集成AI摘要功能，使用星火Spark-Lite API生成摘要，并将其存储在文章的frontmatter中。这样既保证了访问速度，又能为读者提供有价值的内容预览。

## 前置准备

### 申请星火Spark-Lite

1. 访问 [星火大模型API](https://xinghuo.xfyun.cn/sparkapi)
2. 下滑页面，选择 `Spark-Lite`，点击立即调用
3. 点击创建新应用，之后侧边栏点击 `Spark Lite`，选择领取无限量
4. 记录生成的 `APPID`、`APISecret`、`APIKey`，这些将用于后续配置

### 搭建Vercel API代理

为了在前端安全地调用Spark-Lite API，我们需要部署一个代理服务器：

1. 一键部署到Vercel：[spark-ai-summary](https://vercel.com/new/clone?repository-url=https://github.com/ljxme/spark-ai-summary&project-name=spark-ai-summary&repository-name=spark-ai-summary)
2. 在Vercel项目仪表盘的 **Settings** > **Environment Variables** 中添加以下环境变量：
   - `SPARK_APPID`：对应Spark Lite的APPID
   - `SPARK_API_KEY`：对应Spark Lite的APIKey
   - `SPARK_API_SECRET`：对应Spark Lite的APISecret
3. 配置完成后重新部署项目

部署后，Vercel会提供一个类似 `https://[your-project-name].vercel.app` 的域名，我们可以通过 `/api/spark-proxy` 接口访问API。

## MapleBlog的改动点

### 1. 添加核心文件

在MapleBlog项目中添加以下文件：

- `src/plugins/aisummary.js` - AI摘要核心脚本，包含打字动画效果
- `src/assets/styles/aisummary.css` - AI摘要样式文件，适配MapleBlog的设计
- `scripts/generateSummary.ts` - 本地生成摘要的TypeScript脚本
- `src/plugins/aisummary.config.js` - AI摘要配置文件

### 1. 添加ai字段定义

在 `src/content/config.ts` 文件中为博客文章集合添加 `ai` 字段：

```typescript
// 博客文章集合
const blog = defineCollection({
  loader: glob({ pattern: "**\/[^_]*.{md,mdx}", base: "./src/content/blog" }),
  schema: ({ image }) =>
    baseContent.extend({
      // 其他字段...
      draft: z.boolean().default(false),
      ai: z.boolean().default(true), // 添加ai字段，默认为true
      summary: z.string().optional(),
    }),
});
```

### 2. 修改布局组件

#### 修改 `src/components/base/BaseLayout.astro`

在布局组件中添加AI摘要的样式和脚本：

```astro
---
import aisummaryConfig from '../../plugins/aisummary.config.js?url';
import aisummary from '../../plugins/aisummary.js?url';
import aisummaryCss from '../../assets/styles/aisummary.css?url';
---

<!-- AISummary 工具 -->
<script src={aisummaryConfig} is:inline></script>
{Astro.url.pathname.startsWith('/blog/') && <script src={aisummary} is:inline></script>}
<!-- AISummary 样式 -->
<link rel='stylesheet' href={aisummaryCss} />
```

#### 修改 `src/components/blog/EntryLayout.astro`

在博客文章布局中添加AI摘要UI组件，并使用紫色SVG图标，同时添加对 `ai` 字段的检查：

```astro
<!-- AISummary AI摘要 -->
{entry.data.summary && entry.data.ai !== false && (
  <div class='aisummary-container'>
    <div class='aisummary-title'>
      <i class='aisummary-title-icon'>
        <svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'>
          <title>机器人</title>
          <g stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'>
            <path d='M34.717885,5.03561087 C36.12744,5.27055371 37.079755,6.60373651 36.84481,8.0132786 L35.7944,14.3153359 L38.375,14.3153359 C43.138415,14.3153359 47,18.1768855 47,22.9402569 L47,34.4401516 C47,39.203523 43.138415,43.0650727 38.375,43.0650727 L9.625,43.0650727 C4.861585,43.0650727 1,39.203523 1,34.4401516 L1,22.9402569 C1,18.1768855 4.861585,14.3153359 9.625,14.3153359 L12.2056,14.3153359 L11.15519,8.0132786 C10.920245,6.60373651 11.87256,5.27055371 13.282115,5.03561087 C14.69167,4.80066802 16.024865,5.7529743 16.25981,7.16251639 L17.40981,14.0624532 C17.423955,14.1470924 17.43373,14.2315017 17.43948,14.3153359 L30.56052,14.3153359 C30.56627,14.2313867 30.576045,14.1470924 30.59019,14.0624532 L31.74019,7.16251639 C31.975135,5.7529743 33.30833,4.80066802 34.717885,5.03561087 Z M38.375,19.4902885 L9.625,19.4902885 C7.719565,19.4902885 6.175,21.0348394 6.175,22.9402569 L6.175,34.4401516 C6.175,36.3455692 7.719565,37.89012 9.625,37.89012 L38.375,37.89012 C40.280435,37.89012 41.825,36.3455692 41.825,34.4401516 L41.825,22.9402569 C41.825,21.0348394 40.280435,19.4902885 38.375,19.4902885 Z M14.8575,23.802749 C16.28649,23.802749 17.445,24.9612484 17.445,26.3902253 L17.445,28.6902043 C17.445,30.1191812 16.28649,31.2776806 14.8575,31.2776806 C13.42851,31.2776806 12.27,30.1191812 12.27,28.6902043 L12.27,26.3902253 C12.27,24.9612484 13.42851,23.802749 14.8575,23.802749 Z M33.1425,23.802749 C34.57149,23.802749 35.73,24.9612484 35.73,26.3902253 L35.73,28.6902043 C35.73,30.1191812 34.57149,31.2776806 33.1425,31.2776806 C31.71351,31.2776806 30.555,30.1191812 30.555,28.6902043 L30.555,26.3902253 C30.555,24.9612484 31.71351,23.802749 33.1425,23.802749 Z' fill-rule='nonzero'></path>
          </g>
        </svg>
      </i>
      <div class='aisummary-title-text'>AI摘要</div>
      <div class='aisummary-tag' id='aisummary-tag'>AI生成</div>
    </div>
    <div class='aisummary-explanation' data-ai-summary={entry.data.summary}>{entry.data.summary}</div>
    <div class='aisummary-disclaimer'>本摘要由AI生成，仅供参考，内容准确性请以原文为准。</div>
  </div>
)}
```

### 3. 配置样式

在 `src/assets/styles/aisummary.css` 中添加以下样式，适配MapleBlog的设计：

```css
.aisummary-container {
  margin: 2rem 0;
  padding: 1.5rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.aisummary-title {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  gap: 0.75rem;
}

.aisummary-title-icon svg {
  width: 1.5rem;
  height: 1.5rem;
  fill: #8B5CF6;
}

.aisummary-title-text {
  font-size: 1.125rem;
  font-weight: 600;
  color: #ffffff;
}

.aisummary-tag {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  background: rgba(139, 92, 246, 0.2);
  color: #8B5CF6;
  font-weight: 500;
}

.aisummary-explanation {
  margin-bottom: 1rem;
  line-height: 1.6;
  color: #e5e7eb;
}

.aisummary-disclaimer {
  font-size: 0.875rem;
  color: #9ca3af;
  text-align: right;
}

@media (max-width: 768px) {
  .aisummary-container {
    padding: 1.25rem;
    margin: 1.5rem 0;
  }
  
  .aisummary-title-text {
    font-size: 1rem;
  }
}
```

### 4. 配置脚本

#### 4.1 配置AI摘要参数

在 `src/plugins/aisummary.config.js` 中配置API和动画选项：

```javascript
window.aisummaryConfig = {
  // API配置
  api: {
    endpoint: 'https://your-project-name.vercel.app/api/spark-proxy',
    key: '', // Spark-Lite不需要API Key
    model: 'lite'
  },
  
  // 动画配置
  typing: {
    enabled: true,
    speed: 30,
    delay: 1000
  },
  
  // 选择器配置
  selectors: {
    post: '#content',
    summary: '.aisummary-explanation'
  }
};
```

#### 4.2 增强摘要生成脚本

在 `src/scripts/generateSummary.ts` 中添加对 `AISUMMARY_COVER_ALL` 环境变量和 `ai` 字段的支持：

```typescript
// 从环境变量读取是否重新生成所有摘要（AISUMMARY_COVER_ALL）
function getCoverAll(): boolean {
  const raw = (process.env.AISUMMARY_COVER_ALL || '').trim().toLowerCase();
  if (!raw) return false;
  if (['true', '1', 'yes', 'y'].includes(raw)) return true;
  if (['false', '0', 'no', 'n'].includes(raw)) return false;
  return false;
}

// 从 frontmatter 中读取 ai 字段（用于判断是否生成摘要）
function readAiFromFrontmatter(frontmatter: string): boolean {
  const m = frontmatter.match(/\nai:\s*(false|true|0|1)\s*\n/);
  if (!m) return true; // 默认值为 true
  const value = m[1].toLowerCase();
  return value === 'true' || value === '1';
}

// 在processOne函数中添加检查
async function processOne(file: string, limit: number): Promise<void> {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const { frontmatter, body } = splitFrontmatterAndBody(content);
    const bodyOnly = extractBodyOnly(content);
    const title = readTitleFromFrontmatter(frontmatter);
    const limitedBody = limitBody(bodyOnly, limit);
    const coverAll = getCoverAll();
    const useAI = readAiFromFrontmatter(frontmatter);

    // 检查是否启用AI摘要
    if (!useAI) {
      log(1, `跳过AI摘要（ai=false）：${path.relative(ROOT, file)}`);
      return;
    }

    // 已有摘要时，按策略处理是否覆盖
    if (hasSummaryInFrontmatter(frontmatter)) {
      const existing = readSummaryFromFrontmatter(frontmatter);
      // 如果AISUMMARY_COVER_ALL为false，跳过已有摘要的文件
      if (!coverAll) {
        log(1, `跳过已有摘要（AISUMMARY_COVER_ALL=false）：${path.relative(ROOT, file)}`);
        return;
      }
      // 后续代码省略...
    }
    // 后续代码省略...
  }
  // 后续代码省略...
}
```

### 5. 添加环境变量

在项目根目录创建 `.env.local` 文件，添加以下环境变量：

```
# AI摘要API配置
AI_SUMMARY_API=https://your-project-name.vercel.app/api/spark-proxy
AI_SUMMARY_KEY=
AI_SUMMARY_MODEL=lite

# 摘要生成配置
AISUMMARY_CONCURRENCY=2
AISUMMARY_COVER_ALL=false
AISUMMARY_MAX_TOKEN=5000
AISUMMARY_MIN_CONTENT_LENGTH=50
```

## 使用方法

### 1. 安装依赖

在项目根目录运行以下命令安装所需依赖：

```bash
pnpm add -D tsx
```

### 2. 配置环境变量

在项目根目录的 `.env.local` 文件中配置以下环境变量：

```
# AI摘要API配置
AI_SUMMARY_API=https://your-project-name.vercel.app/api/spark-proxy
AI_SUMMARY_KEY=
AI_SUMMARY_MODEL=lite

# 摘要生成配置
AISUMMARY_CONCURRENCY=2
AISUMMARY_COVER_ALL=false  # 是否重新生成所有摘要
AISUMMARY_MAX_TOKEN=5000
AISUMMARY_MIN_CONTENT_LENGTH=50
```

### 3. 生成摘要

在项目根目录运行以下命令生成摘要：

```bash
npx tsx scripts/generateSummary.ts
```

该命令会：
- 遍历 `src/content/blog` 目录下的所有Markdown文件（除了 `-index.md`）
- 当 `AISUMMARY_COVER_ALL=false` 时，只对没有 `summary` 字段的文章生成摘要
- 当文章的 `ai: false` 时，跳过该文章的摘要生成
- 为符合条件的文章生成AI摘要并添加到frontmatter中

### 4. 控制单篇文章的AI摘要

在文章的frontmatter中添加 `ai` 字段，可以控制是否为该文章启用AI摘要：

```yaml
---
title: 示例文章
description: 这是一篇示例文章
ai: false  # 禁用AI摘要
---
```

- `ai: true`（默认）：为文章生成和显示AI摘要
- `ai: false`：不生成也不显示AI摘要

### 5. 验证结果

生成摘要后，可以打开任意博客文章，查看是否在文章顶部显示了AI摘要部分。摘要会以打字动画的形式展示，提升用户体验。

## 故障排除

### 1. SVG图标不显示

如果SVG图标不显示，请检查：
- SVG代码是否正确
- CSS中是否正确设置了 `fill` 属性
- 图标是否与背景颜色对比明显

### 2. 摘要生成失败

如果摘要生成失败，请检查：
- Vercel代理服务器是否正常运行
- 环境变量配置是否正确
- Spark-Lite API是否有足够的配额

### 3. 打字动画不工作

如果打字动画不工作，请检查：
- `aisummary.js` 文件是否正确加载
- `aisummary.config.js` 中的动画配置是否启用
- 浏览器控制台是否有错误信息

## 结语

通过以上步骤，我们成功在MapleBlog中实现了功能完善的AI摘要系统，具有以下特点：

1. **智能摘要生成**：使用星火Spark-Lite API生成高质量的文章摘要
2. **本地存储**：将摘要存储在文章的frontmatter中，避免每次访问都请求API
3. **灵活配置**：通过 `AISUMMARY_COVER_ALL` 环境变量控制是否重新生成所有摘要
4. **细粒度控制**：通过文章的 `ai` 字段控制单篇文章是否启用AI摘要
5. **美观展示**：集成紫色SVG图标和打字动画效果，提升用户体验
6. **响应式设计**：适配不同屏幕尺寸的样式

这个实现不仅提升了博客的用户体验，还展示了如何将AI技术与静态站点生成相结合，为读者提供更好的内容体验。

通过本地生成摘要的方式，我们既保证了访问速度，又能为读者提供有价值的内容预览。同时，灵活的配置选项让我们可以根据需要控制摘要的生成和显示。

希望本文对你有所帮助，如果你有任何问题或建议，欢迎在评论区留言。

## 参考资料

- [本地实现Astro文章AI摘要](https://blog.ljx.icu/blog/ai-summary/)
- [hexo基于TianliGPT使用免费的Spark-Lite制作AI摘要](https://www.konoxin.top/posts/db7b3418)
- [本地实现HEXO文章AI摘要](https://blog.liushen.fun/posts/40702a0d/)
- [原文](https://blog.ljx.icu/blog/aisummary-blog)

*我的修改后ai摘要就自己看[源码(https://github.com/zsxcoder/MapleBlog)吧。* 
