---
title: 在MapleBlog中实现加密文章功能
description: 详细介绍如何在MapleBlog中实现加密文章功能，包括配置方法、实现原理和使用步骤
tags: ["MapleBlog", "加密", "安全", "前端"]
categories: ["技术", "博客优化"]
featured: true
image: "https://cdn.jsdmirror.com/gh/zsxcoder/github-img@main/img/essays-locked.avif"
recommended: true
hideToc: false
ai: true
summary: "本文详细介绍了在MapleBlog中实现加密文章功能的方法，包括如何通过frontmatter配置加密文章、实现原理、安全考虑以及使用步骤，帮助博客主保护敏感内容，提升用户体验。"
---

## 起因

在维护个人博客时，有时我们可能会写一些包含敏感信息的文章，比如个人日记、技术笔记、商业计划等，不希望所有人都能看到这些内容。为了保护这些敏感信息，同时又能在博客中发布，加密文章功能就显得尤为重要。

MapleBlog已经内置了加密文章功能，通过简单的配置就能实现文章加密，只有输入正确密码的用户才能查看文章内容。本文将详细介绍如何在MapleBlog中使用和理解加密文章功能。

## 实现原理

### 技术架构

MapleBlog的加密文章功能基于以下技术实现：

1. **前端加密控制**：通过条件渲染控制文章内容的显示/隐藏
2. **密码验证**：使用SHA256哈希算法验证密码
3. **用户体验**：提供美观的密码输入界面和错误提示
4. **数据存储**：通过文章frontmatter存储加密配置和密码

### 核心代码分析

#### 1. 密码哈希处理

在`src/components/blog/EntryLayout.astro`文件中，定义了密码哈希函数：

```typescript
const hashPassword = (input: string): string => {
  return crypto.createHash("sha256").update(input).digest("hex");
};

const passwordHash = encrypted && password ? hashPassword(password) : undefined;
```

这段代码使用Node.js的`crypto`模块对密码进行SHA256哈希处理，生成不可逆的哈希值用于验证。

#### 2. 加密文章渲染逻辑

当文章被标记为加密时，会显示密码输入界面：

```astro
<div id="encrypted-article" data-encrypted={encrypted ? "true" : "false"} class={encrypted ? "encrypted" : ""}>
  {encrypted && (
    <div class="password-lock-screen flex justify-center py-16" id="password-lock-screen">
      <div class="glass rounded-[35px] p-8 w-full max-w-md text-center mx-4">
        <!-- 密码输入界面 -->
        <form id="password-form" class="space-y-4" onsubmit="return false;">
          <div>
            <input
              type="password"
              id="password-input"
              placeholder="请输入密码"
              class="w-full glass rounded-[20px] px-5 py-3 text-txt-p dark:text-darkmode-txt-p placeholder:text-txt-light dark:placeholder:text-darkmode-txt-light focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
            />
            <p id="password-error" class="text-red-500 text-sm mt-2 flex items-center justify-center gap-1" style="display: none;">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
              密码错误，请重试
            </p>
          </div>

          <button
            type="button"
            id="unlock-btn"
            class="w-full rounded-[20px] px-5 py-3 bg-[var(--primary)] text-white font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            解锁文章
          </button>
        </form>
      </div>
    </div>
  )}

  <!-- 加密内容 -->
  <div id="article-content" class="encrypted-content">
    <!-- 文章内容 -->
  </div>
</div>
```

#### 3. 密码验证组件

在`src/components/common/PasswordInput.tsx`中，实现了密码验证逻辑：

```typescript
const hashPassword = async (input: string): Promise<string> => {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  } catch {
    throw new Error("Crypto API not available");
  }
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!password) return;

  setIsLoading(true);
  setError(false);

  try {
    const inputHash = await hashPassword(password);

    if (inputHash === passwordHash) {
      setIsLoading(false);
      onUnlock();
    } else {
      setIsLoading(false);
      setError(true);
      setPassword("");
    }
  } catch (err) {
    setIsLoading(false);
    setError(true);
  }
};
```

#### 4. 类型定义

在`src/content/config.ts`中，定义了加密文章相关的字段：

```typescript
// 博客文章集合
const blog = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/blog" }),
  schema: ({ image }) =>
    baseContent.extend({
      // 其他字段...
      // 加密文章支持
      encrypted: z.boolean().default(false),
      password: z.string().optional(),
    }),
});
```

## 配置方法

### 基本配置

要创建加密文章，只需在文章的frontmatter中添加以下字段：

```yaml
---
title: "加密测试文章"
description: "这是一篇测试加密功能的文章"
# 其他字段...
encrypted: true  # 标记文章为加密
password: "123456"  # 设置密码
---
```

### 配置参数说明

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `encrypted` | boolean | 否 | false | 是否加密文章 |
| `password` | string | 是（当encrypted为true时） | - | 文章密码 |

### 安全考虑

1. **密码存储**：密码以明文形式存储在frontmatter中，建议使用强密码
2. **密码传输**：密码验证在客户端完成，不会传输到服务器
3. **哈希算法**：使用SHA256哈希算法验证密码，安全性较高
4. **敏感信息**：加密文章的标题、描述等frontmatter信息仍然可见

## 使用步骤

### 1. 创建加密文章

在`src/content/blog`目录下创建新的Markdown文件，添加加密配置：

```yaml
---
title: "我的私密日记"
description: "这是一篇加密的私密日记"
categories: ["个人"]
tags: ["日记", "私密"]
encrypted: true
password: "your-strong-password"
---

这里是加密内容，只有输入正确密码才能看到...
```

### 2. 查看加密文章

1. 访问加密文章页面，会看到密码输入界面
2. 输入正确的密码，点击"解锁文章"按钮
3. 密码验证通过后，即可查看文章内容

### 3. 密码错误处理

如果输入错误的密码，会显示错误提示：
- 密码输入框下方会显示"密码错误，请重试"的提示
- 密码输入框会被清空，方便重新输入

## 功能特点

1. **简单易用**：只需在frontmatter中添加两个字段即可实现加密
2. **美观界面**：密码输入界面采用玻璃拟态设计，与整体风格一致
3. **安全可靠**：使用SHA256哈希算法验证密码
4. **用户友好**：提供清晰的错误提示和加载状态
5. **响应式设计**：密码输入界面适配不同屏幕尺寸

## 高级用法

### 1. 为现有文章添加加密

对于已有的文章，只需编辑frontmatter，添加加密配置即可：

```yaml
---
title: "现有文章"
description: "这是一篇已有的文章"
# 其他字段...
encrypted: true  # 添加加密标记
password: "password123"  # 设置密码
---
```

### 2. 移除文章加密

要移除文章加密，只需将`encrypted`字段设置为`false`或删除该字段：

```yaml
---
title: "不再加密的文章"
description: "这篇文章不再需要加密"
# 其他字段...
encrypted: false  # 移除加密
# password: "password123"  # 可以保留或删除
---
```

### 3. 更改加密密码

要更改文章密码，只需修改`password`字段的值：

```yaml
---
title: "加密文章"
description: "这是一篇加密文章"
# 其他字段...
encrypted: true
password: "new-password"  # 更改密码
---
```

## 故障排除

### 1. 密码无法解锁

- 检查密码是否正确（区分大小写）
- 检查frontmatter中的`password`字段是否正确设置
- 清除浏览器缓存后重试

### 2. 加密界面不显示

- 检查`encrypted`字段是否设置为`true`
- 检查文章是否正确部署
- 检查浏览器控制台是否有错误信息

### 3. 文章内容部分可见

- 注意：文章的标题、描述、分类、标签等frontmatter信息仍然可见
- 只有文章正文内容会被加密

## 结语

MapleBlog的加密文章功能为博客主提供了一种简单有效的方式来保护敏感内容，同时保持了良好的用户体验。通过本文的介绍，相信你已经了解了如何在MapleBlog中使用和配置加密文章功能。

加密文章功能不仅可以用于保护个人隐私，还可以用于创建会员专享内容、付费内容预览等场景，为博客增加更多可能性。

如果你有任何问题或建议，欢迎在评论区留言讨论。

## 参考资料

- [MapleBlog源码](https://github.com/zsxcoder/MapleBlog)
- [Node.js Crypto模块文档](https://nodejs.org/docs/latest-v20.x/api/crypto.html)
- [Web Crypto API文档](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
