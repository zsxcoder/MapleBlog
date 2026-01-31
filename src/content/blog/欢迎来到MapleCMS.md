---
title: 欢迎使用 MapleBlog
description: 本文是 MapleBlog 的默认示例，帮助你快速了解如何使用本系统发布内容。MapleBlog 是一款轻量级、开源的内容管理系统，专为个人博客、文档站点与小团队协作设计。
createdAt: 2025-11-17
updatedAt: 2025-11-17
categories:
  - 使用说明
author: Maple
image: "https://img.314926.xyz/h"
tags:
  - 文章
  - 示例
draft: false
hideToc: false
summary: "MapleBlog是一款轻量级、开源的内容管理系统，专为个人博客、文档站点和小团队协作设计，它基于Astrola构建，支持Markdown、组件化布局和静态生成，让写作与部署变得简单，用户可以克隆仓库、安装依赖、本地启动并实时预览，新建文章时，可以使用Frontmatter模板撰写正文，支持多种Markdown语法和组件，生成的目录可以直接上传至静态托管平台，此外，MapleBlog还提供了博客、笔记、页面、友链、首页卡片等管理功能，集成了Twikoo评论系统，支持多平台评论管理，友链系统支持本地JSON配置，全文搜索基于Astr内容构建，深色浅色模式可切换，响应式设计适配多端设备，高性能通过静态生成和边缘缓存实现首屏极速加载，MapleBlog追求“够用、好用、轻量”的理念，鼓励创作者将精力放在内容本身。"
---
# 欢迎来到 MapleBlog 示例文章

> 本文是 MapleBlog 的默认示例，帮助你快速了解如何使用本系统发布内容。

## 项目简介

MapleBlog 是一款轻量级、开源的内容管理系统，专为个人博客、文档站点与小团队协作设计。它基于 Astro 构建，天然支持 Markdown、组件化布局与静态生成，让写作与部署都变得无比简单。

## 快速开始

1. 克隆仓库  
   ```bash
   git clone https://github.com/zsxcoder/MapleBlog.git
   cd MapleBlog
   ```

2. 安装依赖  
   ```bash
   npm install
   ```

3. 本地启动  
   ```bash
   npm run dev
   ```
   浏览器访问 `http://localhost:4321` 即可实时预览。

4. 新建文章  
   在 `src/content/blog/` 目录下新建 `.md` 文件，Frontmatter 模板如下：

   ```yaml
   ---
   title: 文章标题
   description: 一句话描述
   createdAt: 2025-05-21
   updatedAt: 2025-05-21
   categories:
     - 示例分类
   author: 你的昵称
   image: "@assets/demo.png"
   tags:
     - 示例标签
   draft: false
   hideToc: false
   ---
   ```

5. 撰写正文  
   使用标准 Markdown 语法，支持：

   - 代码高亮
   - 数学公式（KaTeX）
   - Mermaid 流程图
   - 自定义组件（`<Image />`、`<Video />` 等）

6. 构建与部署  
   ```bash
   npm run build
   ```
   生成的 `dist/` 目录可直接上传至任意静态托管平台（Vercel、Netlify、GitHub Pages…）。

## 特色功能

- 📝 容管理：博客、笔记、页面、友链、首页卡片
- 💬 评论系统：集成 Twikoo，支持多平台评论管理
- 👥 友链系统：支持本地 JSON 配置（`public/data/friends.json`）
- 🔍 全文搜索：基于 Astro 内容构建的本地搜索
- 🌓 深色/浅色模式：可切换深色或浅色模式
- 📱 响应式设计：适配桌面、平板、手机多端
- ⚡ 高性能：静态生成 + 边缘缓存，首屏极速加载


## 结语

MapleBlog 追求“够用、好用、轻量”的理念，让创作者把精力放回内容本身。如果你觉得项目有帮助，欢迎 Star ⭐ 与分享！  
更多进阶玩法，请查阅[官方文档](https://MapleBlog.example.com/docs)。

---  
*最后更新：2026-01-28*

