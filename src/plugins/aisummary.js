// AISummary
console.log(
  '%cAISummary v1.0.0 %c https://blog.ljx.icu/blog/aisummary-blog/',
  'color:#fff;background:linear-gradient(90deg,#ff8acb,#ff5ebc,#ff1493);padding:5px 12px;border-radius:4px 0 0 4px;',
  'color:#000;background:linear-gradient(90deg,#ff1493,#ffb6c1,#fff);padding:5px 14px 5px 8px;border-radius:0 4px 4px 0;'
)

// 运行标记，防止重复动画
let aisummaryIsRunning = false;

// 核心对象：仅保留静态摘要读取与动画显示
const aisummary = {
  /**
   * 获取摘要纯文本
   * @returns 优先返回 data-ai-summary 的值，否则返回元素文本
   */
  getStaticSummary() {
    const el = document.querySelector('.aisummary-explanation');
    if (!el) return '';
    const attr = el.getAttribute('data-ai-summary');
    const text = attr && attr.trim().length ? attr : (el.textContent || '').trim();
    return text || '';
  },

  /**
   * 展示摘要文本：根据开关决定是否执行打字机动画
   * @param {string} text 完整摘要文本
   */
  aiShowAnimation(text) {
    const element = document.querySelector('.aisummary-explanation');
    if (!element || !text) return;

    // 重置状态，确保每次刷新都执行动画
    aisummaryIsRunning = false;
    element.innerHTML = '';

    if (aisummaryIsRunning) return;

    // 不启用动画时直接渲染
    if (typeof window !== 'undefined' && typeof window.aisummaryTypingAnimate !== 'undefined' && !window.aisummaryTypingAnimate) {
      element.innerHTML = text;
      element.style.maxHeight = 'none';
      element.style.overflow = 'visible';
      element.classList.add('visible');
      return;
    }

    aisummaryIsRunning = true;

    // 打字机动画配置 - 更流畅的参数
    const TYPING_DELAY = 30; // 基础打字速度 (毫秒)
    const PUNCTUATION_DELAY = 150; // 标点符号停顿时间
    const FAST_TYPING_DELAY = 15; // 快速打字时的延迟

    // 添加容器淡入动画
    const container = document.querySelector('.aisummary-container');
    if (container) {
      container.style.opacity = '0';
      container.style.transform = 'translateY(10px)';
      container.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
      requestAnimationFrame(() => {
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
      });
    }

    element.style.display = 'block';
    element.classList.add('visible');
    element.style.maxHeight = 'none';
    element.style.overflow = 'visible';
    element.innerHTML = '<span class="typing-text"></span><span class="typing-cursor"></span>';

    const typingTextEl = element.querySelector('.typing-text');
    const typingCursorEl = element.querySelector('.typing-cursor');

    let currentIndex = 0;
    let lastUpdateTime = performance.now();
    let isTypingPunctuation = false;

    const animate = () => {
      if (currentIndex < text.length && aisummaryIsRunning) {
        const currentTime = performance.now();
        const letter = text[currentIndex];
        const isPunctuation = /[，。！？、,.!?]/.test(letter);
        const isNewline = letter === '\n';

        // 计算延迟时间
        let delay = isPunctuation ? PUNCTUATION_DELAY : TYPING_DELAY;

        // 连续输入时加快速度
        if (currentIndex > 10 && !isPunctuation && !isNewline) {
          delay = FAST_TYPING_DELAY;
        }

        if (currentTime - lastUpdateTime >= delay) {
          lastUpdateTime = currentTime;

          // 处理换行
          if (isNewline) {
            typingTextEl.innerHTML += '<br>';
          } else {
            // 处理特殊字符的HTML转义
            const escapedLetter = letter
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
            typingTextEl.innerHTML += escapedLetter;
          }

          currentIndex++;

          // 动画完成
          if (currentIndex >= text.length) {
            aisummaryIsRunning = false;
            typingCursorEl.style.opacity = '0';
            if (observer && container) observer.unobserve(container);
            return;
          }
        }
        requestAnimationFrame(animate);
      }
    };

    if (!container) return;

    // 使用 IntersectionObserver 进入视口时触发动画
    const observer = new IntersectionObserver((entries) => {
      const isVisible = entries[0].isIntersecting;
      if (isVisible) {
        requestAnimationFrame(animate);
        observer.unobserve(container);
      }
    }, { threshold: 0.1 });

    observer.observe(container);

    // 如果元素已经在视口中，立即开始动画
    if (container.offsetParent !== null) {
      const rect = container.getBoundingClientRect();
      const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
      if (isInViewport) {
        observer.unobserve(container);
        requestAnimationFrame(animate);
      }
    }
  }
};

/**
 * 确保摘要容器插入到正文容器的开头位置
 */
function ensureSummaryPosition() {
  const selectorFromWindow = (typeof window !== 'undefined' && typeof window.aisummaryPostSelector === 'string' && window.aisummaryPostSelector.trim().length)
    ? window.aisummaryPostSelector
    : null;
  const containerSelector = selectorFromWindow || '#content';
  const contentEl = document.querySelector(containerSelector);
  const summaryEl = document.querySelector('.aisummary-container');
  if (!contentEl || !summaryEl) return;
  if (!contentEl.contains(summaryEl)) {
    contentEl.insertBefore(summaryEl, contentEl.firstChild);
  }
}

/**
 * 初始化 AISummary：读取静态摘要并渲染（或执行动画）
 */
function initializeAISummary() {
  const summaryEl = document.querySelector('.aisummary-explanation');
  if (!summaryEl) return;
  ensureSummaryPosition();
  const summary = aisummary.getStaticSummary();
  if (!summary) return;
  aisummary.aiShowAnimation(summary);
}

/**
 * 保证在各种加载时机下都能触发初始化
 * - 若文档仍在解析（readyState === 'loading'），监听 DOMContentLoaded
 * - 若文档已解析完成，立即执行初始化
 * - 为避免重复绑定，先移除旧的 DOMContentLoaded 监听器
 */
(function ensureInit() {
  document.removeEventListener('DOMContentLoaded', initializeAISummary);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAISummary);
  } else {
    initializeAISummary();
  }

  // 监听 Astro 视图转换事件，确保页面切换后也能正确初始化
  document.addEventListener('astro:page-load', () => {
    aisummaryIsRunning = false;
    initializeAISummary();
  });
})();
