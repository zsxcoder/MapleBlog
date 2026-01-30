---
title: 在MapleBlog中实现友链检测功能
description: 详细介绍如何在MapleBlog Astro博客中添加友链检测功能，包括状态监控、响应时间统计和前端显示
createdAt: 2026-01-30
updatedAt: 2026-01-30
categories:
  - 技术
  - 博客优化
tags:
  - Astro
  - 前端
  - 博客
  - 友链
status: published
featured: true
recommended: true
hideToc: false
draft: false
ai: true
summary: "文章详细介绍了如何在MapleBlog中实现友链检测功能，包括创建检测脚本、配置GitHub Actions自动检测、前端显示响应时间和状态，以及如何通过Vercel部署钩子实现自动更新，帮助博客主实时监控友链状态，提升用户体验。"
---
## 起因

在维护个人博客时，友链是连接博主之间的重要桥梁。然而，随着时间推移，一些友链可能会失效、响应缓慢或无法访问，这不仅影响用户体验，也可能影响搜索引擎对博客的评价。

为了及时发现和处理这些问题，我决定在MapleBlog中实现一个友链检测功能，能够自动监控友链状态，统计响应时间，并在前端直观显示。这样不仅可以确保友链的有效性，还能为访问者提供更多关于友链网站的信息。

## 实现方案

### 技术选型

1. **检测脚本**：使用TypeScript编写，利用Node.js的`fetch` API检测友链状态
2. **任务调度**：使用GitHub Actions定期执行检测任务
3. **数据存储**：将检测结果存储在`public/data/friends.json`文件中
4. **前端显示**：在友链页面显示检测结果，包括响应时间和状态
5. **自动部署**：使用Vercel部署钩子在检测完成后自动更新网站

### 实现步骤

#### 1. 创建友链检测脚本

首先，在`scripts/`目录下创建`check-links.ts`文件，用于检测友链状态：

```typescript
import fs from 'node:fs/promises'
import path from 'node:path'
import pLimit from 'p-limit'

import links from '../public/data/friends.json' with { type: 'json' }

const DATA_PATH = path.resolve('public/data/friends.json')
const CHECK_TIMEOUT = 15000
const PLimit_NUM = 5
const MAX_RETRIES = 3
const RETRY_DELAY = 1000
const SKIP_CHECK_NAMES = ['']

interface FriendLink {
  id: string
  name: string
  url: string
  description: string
  avatar: string
  status: string
  category_code: string
  sort_order: number
  responseTime?: number
}

interface Category {
  id: string
  name: string
  code: string
  sort_order: number
}

interface FriendLinksConfig {
  categories: Category[]
  links: FriendLink[]
}

type LinkStatus = 'ok' | 'timeout' | 'error'

interface LinkCheckResult {
  name: string
  link: string
  status?: LinkStatus
  httpStatus?: number
  responseTime?: number
  reason?: string
}

async function fetchLink(url: string) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), CHECK_TIMEOUT)

  try {
    const start = Date.now()
    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      cache: 'no-store',
      headers: { 'User-Agent': 'Mozilla/5.0 FriendLinkChecker/1.0' }
    })
    const time = Date.now() - start

    return {
      ok: res.ok,
      status: res.status,
      time
    }
  } finally {
    clearTimeout(timer)
  }
}

const ENV_SKIP_NAMES = process.env.SKIP_CHECK_NAMES?.split(',') || []
const SKIP_NAMES = new Set(
  SKIP_CHECK_NAMES.concat(ENV_SKIP_NAMES)
    .map((s) => s.trim())
    .filter(Boolean)
)
async function checkLink(link: FriendLink): Promise<LinkCheckResult> {
  if (SKIP_NAMES.has(link.name)) {
    console.log(`[Check-Links] ${link.name} (${link.url}) skipped 🧹`)
    return {
      name: link.name,
      link: link.url,
      status: 'ok',
      reason: 'skip_check',
      responseTime: 0
    }
  }

  let lastError: Error | null = null

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const res = await fetchLink(link.url)
      console.log(`[Check-Links] ${link.name} responded in ${res.time}ms ✨`)

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      return {
        name: link.name,
        link: link.url,
        status: 'ok',
        httpStatus: res.status,
        responseTime: res.time
      }
    } catch (e: unknown) {
      lastError = e instanceof Error ? e : new Error(String(e))
      if (i < MAX_RETRIES - 1) {
        const delay = RETRY_DELAY * 2 ** i + Math.floor(Math.random() * 100)
        console.warn(
          `[Check-Links] Retry attempt (${i + 1}/${MAX_RETRIES}) for ${link.name} after ${delay}ms due to: ${lastError.message} 😭`
        )
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  return {
    name: link.name,
    link: link.url,
    status: lastError?.name === 'AbortError' ? 'timeout' : 'error',
    reason: lastError?.message,
    responseTime: 0
  }
}

async function main() {
  console.log('[Check-Links] Start checking friend links... ❤️')

  const config = links as FriendLinksConfig
  const limit = pLimit(PLimit_NUM)

  const tasks = config.links
    .filter((link) => link.status === 'active')
    .map((link) => limit(() => checkLink(link)))

  const results = await Promise.allSettled(tasks)

  const linkMap = new Map<string, LinkCheckResult>()

  for (const r of results) {
    if (r.status === 'fulfilled') {
      linkMap.set(r.value.link, r.value)
    } else {
      console.error(`[Check-Links] Unexpected error (${r.reason}) 🤔`)
    }
  }
  for (const link of config.links) {
    const res = linkMap.get(link.url)
    if (res) {
      link.responseTime = res.responseTime ?? 0
    }
  }

  await fs.writeFile(DATA_PATH, JSON.stringify(config, null, 2))

  const failed = Array.from(linkMap.values()).filter((r) => r.status !== 'ok')
  if (failed.length > 0) {
    console.error(
      `[Check-Links] Friend link check failed (${failed.length} inactive links checked) 😡:`
    )
    for (const f of failed) {
      console.error(
        `[Check-Links] - ${f.name} (${f.link}) => ${f.status}`,
        f.reason ? ` | ${f.reason}` : ''
      )
    }
    process.exit(1)
  }

  console.log(
    `[Check-Links] All links are healthy and responseTime updated (${results.length} links checked) 😋`
  )
}

main()
```

这个脚本会：
- 读取`friends.json`文件中的友链数据
- 并发检测每个友链的状态（最多5个并发）
- 对失败的链接进行最多3次重试
- 记录每个友链的响应时间
- 将检测结果写回`friends.json`文件
- 对检测失败的链接输出错误信息

#### 2. 配置GitHub Actions工作流

在`.github/workflows/`目录下创建`check-links.yml`文件，用于定期执行检测任务：

```yaml
name: 🔗 Friend Links Check

on:
  push:
    branches:
      - main
    paths:
      - "public/data/friends.json"
  schedule:
    - cron: "0 16 * * *"
  workflow_dispatch:

jobs:
  check-links-and-update:
    name: Link Check & Upload
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install deps
        run: npm install p-limit tsx

      - name: Run link check
        run: npx tsx scripts/check-links.ts

      - name: Commit and push changes
        run: |
          git config --global user.name "github-actions[bot]"
          git config --global user.email "github-actions[bot]@users.noreply.github.com"
          git add public/data/friends.json
          git commit -m "Update friend links response times"
          git push
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  trigger-vercel-build:
    name: Trigger Vercel build
    needs: check-links-and-update
    runs-on: ubuntu-latest

    if: ${{ needs.check-links-and-update.result == 'success' }}

    steps:
      - name: Update Vercel
        run: |
          curl -X POST \
          "https://api.vercel.com/v1/integrations/deploy/${{ secrets.VERCEL_DEPLOY_HOOK_ID }}" \
          -H "Content-Type: application/json" \
          -d '{"name": "Friend Links Check"}'
```

这个工作流会：
- 在`main`分支更新`friends.json`文件时执行
- 每天16:00自动执行
- 支持手动触发
- 执行友链检测脚本
- 将检测结果提交到仓库
- 触发Vercel部署钩子，自动更新网站

#### 3. 配置前端显示

修改`src/components/common/FriendLinks.astro`文件，在友链卡片中显示响应时间：

```typescript
// 创建友链卡片
function createFriendLinkCard(link, index) {
  const name = link && link.name ? link.name : '';
  const url = link && link.url ? link.url : '#';
  const description = link && link.description ? link.description : '';
  const avatar = link && link.avatar ? link.avatar : '/favicon/logo-192x192.png';
  const status = link && link.status ? link.status : 'active';
  const responseTime = link && link.responseTime ? link.responseTime : null;
  
  // 计算响应时间颜色
  function getResponseTimeColor(time) {
    if (time === null) return 'text-gray-400';
    if (time < 500) return 'text-green-500';
    if (time < 1000) return 'text-yellow-500';
    if (time < 2000) return 'text-orange-500';
    return 'text-red-500';
  }
  
  // 格式化响应时间
  function formatResponseTime(time) {
    if (time === null) return '未知';
    if (time < 1000) return `${time}ms`;
    return `${(time / 1000).toFixed(1)}s`;
  }
  
  return `
    <div class="friend-card glass h-full rounded-[18px] overflow-hidden transition-all duration-300 group backdrop-blur-md relative">
      <a href="${url}" target="_blank" rel="external nofollow noopener noreferrer" class="block h-full p-4 no-underline">
        <div class="flex items-center space-x-3 h-full">
          <!-- 头像 -->
          <div class="flex items-center relative">
            <div class="friend-avatar relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-primary/20 group-hover:ring-primary/40">
              <img src="${avatar}" alt="${name} 的头像" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" loading="lazy" onerror="this.src='/favicon/logo-192x192.png'" />
            </div>
            ${
              status === "active"
                ? `
                <div class="status-indicator top-5 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 z-10" title="正常状态"></div>
              `
                : status === "lost"
                  ? `
                <div class="status-indicator top-5 right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-gray-800 z-10" title="已丢失"></div>
              `
                  : status === "error"
                    ? `
                <div class="status-indicator top-5 right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-gray-800 z-10" title="连接错误"></div>
              `
                    : ""
            }
          </div>
          
          <!-- 内容区域 -->
          <div class="flex-1 min-w-0">
            <!-- 网站名称 -->
            <div class="flex items-center gap-2 mb-1">
              <h3 class="friend-name text-lg font-bold text-txt-p dark:text-darkmode-txt-p truncate group-hover:text-primary transition-colors duration-200">
                ${name}
              </h3>
              ${responseTime !== null ? `
                <span class="text-xs ${getResponseTimeColor(responseTime)}" title="响应时间">
                  ${formatResponseTime(responseTime)}
                </span>
              ` : ''}
            </div>
            
            <!-- 网站描述 -->
            <p class="friend-description text-sm text-txt-light dark:text-darkmode-txt-light line-clamp-2 leading-relaxed">
              ${description}
            </p>
          </div>
        </div>
        
        <!-- 悬浮效果 -->
        <div class="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[18px]"></div>
      </a>
    </div>
  `;
}
```

这段代码会：
- 从友链数据中读取响应时间
- 根据响应时间计算显示颜色（绿色表示快，红色表示慢）
- 格式化响应时间显示（小于1秒显示为毫秒，大于等于1秒显示为秒）
- 在友链卡片的网站名称旁边显示响应时间

## 配置和使用

### 1. 准备友链数据

确保`public/data/friends.json`文件存在，并且格式正确：

```json
{
  "categories": [
    {
      "id": "1",
      "name": "技术博客",
      "code": "tech",
      "sort_order": 1
    }
  ],
  "links": [
    {
      "id": "1",
      "name": "示例博客",
      "url": "https://example.com",
      "description": "这是一个示例博客",
      "avatar": "https://example.com/avatar.png",
      "status": "active",
      "category_code": "tech",
      "sort_order": 1
    }
  ]
}
```

### 2. 配置GitHub Secrets

在GitHub仓库的`Settings > Secrets and variables > Actions`中添加以下secret：

- `VERCEL_DEPLOY_HOOK_ID`：Vercel部署钩子ID，用于在检测完成后自动更新网站

### 3. 手动执行检测

在本地开发时，可以手动执行检测脚本：

```bash
npx tsx scripts/check-links.ts
```

### 4. 查看检测结果

检测完成后，可以在以下位置查看结果：

- GitHub Actions日志：查看检测过程和结果
- `public/data/friends.json`文件：查看更新后的友链数据，包括响应时间
- 博客友链页面：查看前端显示的响应时间和状态

## 功能特点

1. **自动检测**：通过GitHub Actions定期自动检测友链状态
2. **并发处理**：支持并发检测，提高检测效率
3. **智能重试**：对失败的链接进行自动重试，减少误报
4. **响应时间统计**：记录每个友链的响应时间
5. **前端可视化**：在友链页面直观显示响应时间和状态
6. **自动部署**：检测完成后自动更新网站，确保数据实时性
7. **状态分类**：根据响应时间分类显示，帮助识别慢响应的链接

## 故障排除

### 1. 检测脚本执行失败

- 检查Node.js版本是否为20或更高
- 确保安装了所需依赖：`npm install p-limit tsx`
- 检查`friends.json`文件格式是否正确

### 2. 前端不显示响应时间

- 检查`FriendLinks.astro`文件是否正确修改
- 确保`friends.json`文件中包含`responseTime`字段
- 检查浏览器控制台是否有错误信息

### 3. 部署钩子不触发

- 检查`VERCEL_DEPLOY_HOOK_ID`是否正确设置
- 确保GitHub Actions工作流权限正确
- 检查Vercel项目是否正常运行

## 结语

通过以上步骤，我们成功在MapleBlog中实现了功能完善的友链检测系统，具有以下特点：

1. **自动化**：无需手动检测，GitHub Actions定期自动执行
2. **实时性**：检测完成后自动更新网站，确保数据最新
3. **可视化**：前端直观显示友链状态和响应时间
4. **可靠性**：支持重试机制，减少误报
5. **可扩展性**：代码结构清晰，易于添加新功能

这个实现不仅解决了友链监控的问题，还为博客添加了一个实用的功能，提升了用户体验。同时，它也展示了如何将TypeScript、GitHub Actions和前端开发结合起来，构建一个完整的自动化系统。

希望本文对你有所帮助，如果你有任何问题或建议，欢迎在评论区留言。

## 参考资料

- [Node.js Fetch API文档](https://nodejs.org/docs/latest-v20.x/api/globals.html#fetch)
- [GitHub Actions文档](https://docs.github.com/en/actions)
- [Vercel部署钩子文档](https://vercel.com/docs/deployments/deploy-hooks)
- [p-limit文档](https://www.npmjs.com/package/p-limit)

*友链检测功能的完整实现代码可在[MapleBlog源码](https://github.com/zsxcoder/MapleBlog)中查看。*