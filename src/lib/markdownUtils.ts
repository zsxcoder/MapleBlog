// Markdown相关的前端工具函数

/**
 * 将图片转化为/_image?href=http://xxxx.com格式
 * @param url - 原始图片URL
 * @returns 转换后的URL
 */
export function transformImageUrl(url: string): string {
  return `/_image?href=${encodeURIComponent(url)}`;
}

// 仅在客户端执行的代码
if (typeof window !== 'undefined') {
  // 扩展 Window 接口以包含自定义方法
  declare global {
    interface Window {
      copyCode: (button: HTMLElement) => void;
    }
  }

  /**
   * 复制代码功能
   * @param button - 复制按钮元素
   */
  function copyCode(button: HTMLElement): void {
    const codeBlock = button.closest('.code-block-wrapper')?.querySelector('code') as HTMLElement;
    if (!codeBlock) {
      console.error('未找到代码块');
      return;
    }

    const code = codeBlock.textContent || '';

    navigator.clipboard.writeText(code).then(() => {
      // 显示复制成功提示
      const originalHTML = button.innerHTML;
      button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20,6 9,17 4,12"></polyline>
        </svg>
      `;
      button.title = '已复制';

      setTimeout(() => {
        button.innerHTML = originalHTML;
        button.title = '复制代码';
      }, 2000);
    }).catch((err: Error) => {
      console.error('复制失败:', err);
      // 降级方案：选中文本
      const range = document.createRange();
      range.selectNode(codeBlock);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    });
  }

  // 确保 copyCode 函数在全局作用域中可用
  window.copyCode = copyCode;
  // 同时在全局作用域中定义，以确保 onclick 事件可以访问
  (window as any).copyCode = copyCode;

  /**
   * 平滑滚动到锚点
   */
  function smoothScrollToAnchor(): void {
    document.addEventListener('click', function (e: Event) {
      const target = (e.target as Element)?.closest('a[href^="#"]') as HTMLAnchorElement;
      if (target) {
        e.preventDefault();
        const id = target.getAttribute('href')?.substring(1);
        if (id) {
          const element = document.getElementById(id);
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
            // 更新URL
            history.pushState(null, '', `#${id}`);
          }
        }
      }
    });
  }

  /**
   * 为表格添加响应式滚动
   */
  function setupResponsiveTables(): void {
    const tables = document.querySelectorAll('.table-wrapper') as NodeListOf<HTMLElement>;
    tables.forEach(wrapper => {
      const table = wrapper.querySelector('table') as HTMLTableElement;
      if (table && table.scrollWidth > wrapper.clientWidth) {
        wrapper.style.overflowX = 'auto';
      }
    });
  }

  /**
   * 创建图片模态框
   * @param imgSrc - 图片源地址
   * @param imgAlt - 图片alt文本
   * @returns 模态框元素
   */
  function createImageModal(imgSrc: string, imgAlt: string): HTMLElement {
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div class="markdown-content">
        <div class="image-modal">
          <div class="image-modal-backdrop">
            <img src="${imgSrc}" alt="${imgAlt}" class="image-modal-content" />
            <button class="image-modal-close">&times;</button>
          </div>
        </div>
      </div>
    `;
    return modal;
  }

  /**
   * 设置模态框关闭功能
   * @param modal - 模态框元素
   */
  function setupModalClose(modal: HTMLElement): void {
    const closeModal = (): void => {
      modal.classList.add('fade-out');
      setTimeout(() => {
        if (modal.parentElement) {
          modal.remove();
        }
      }, 250); // 与CSS动画时间匹配
    };

    // 点击背景关闭
    const backdrop = modal.querySelector('.image-modal-backdrop') as HTMLElement;
    backdrop?.addEventListener('click', (e: Event) => {
      if (e.target === e.currentTarget) {
        closeModal();
      }
    });

    // 点击关闭按钮
    const closeButton = modal.querySelector('.image-modal-close') as HTMLElement;
    closeButton?.addEventListener('click', closeModal);

    // ESC键关闭
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);

    // 防止页面滚动
    document.body.style.overflow = 'hidden';

    // 模态框关闭时恢复滚动
    const originalRemove = modal.remove.bind(modal);
    modal.remove = function (): void {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
      originalRemove();
    };
  }

  /**
   * 为图片添加点击放大功能
   */
  function setupImageModal(): void {
    const images = document.querySelectorAll('.markdown-image img') as NodeListOf<HTMLImageElement>;
    images.forEach(img => {
      // 确保图片URL格式正确
      let imgSrc = img.src;
      
      // 点击事件
      img.addEventListener('click', function (this: HTMLImageElement) {
        const modal = createImageModal(this.src, this.alt || '');
        setupModalClose(modal);
        document.body.appendChild(modal);
      });
    });
  }

  /**
   * 为代码块复制按钮添加事件监听器
   */
  function setupCopyCodeButtons(): void {
    const copyButtons = document.querySelectorAll('.copy-code-btn') as NodeListOf<HTMLButtonElement>;
    copyButtons.forEach(button => {
      button.addEventListener('click', function() {
        const codeBlock = this.closest('.code-block-wrapper')?.querySelector('code') as HTMLElement;
        if (!codeBlock) {
          console.error('未找到代码块');
          return;
        }

        const code = codeBlock.textContent || '';

        navigator.clipboard.writeText(code).then(() => {
          // 显示复制成功提示
          const originalHTML = this.innerHTML;
          this.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
          `;
          this.title = '已复制';

          setTimeout(() => {
            this.innerHTML = originalHTML;
            this.title = '复制代码';
          }, 2000);
        }).catch((err: Error) => {
          console.error('复制失败:', err);
          // 降级方案：选中文本
          const range = document.createRange();
          range.selectNode(codeBlock);
          const selection = window.getSelection();
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
          }
        });
      });
    });
  }

  /**
   * 初始化所有Markdown相关功能
   */
  function initMarkdownUtils(): void {
    smoothScrollToAnchor();
    setupResponsiveTables();
    setupImageModal();
    setupCopyCodeButtons();
  }

  // 页面加载完成后初始化
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initMarkdownUtils);

    // Astro 页面切换后重新初始化
    document.addEventListener('astro:page-load', initMarkdownUtils);
  }
}

/**
 * 手动初始化复制按钮功能
 * 用于在动态渲染内容后调用
 */
export function initCopyButtons() {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const copyButtons = document.querySelectorAll('.copy-code-btn') as NodeListOf<HTMLButtonElement>;
    copyButtons.forEach(button => {
      // 移除可能存在的旧事件监听器
      button.removeEventListener('click', copyCodeHandler);
      // 添加新的事件监听器
      button.addEventListener('click', copyCodeHandler);
    });
  }
}

/**
 * 复制代码功能的处理函数
 * @param event - 点击事件
 */
function copyCodeHandler(event: MouseEvent) {
  const button = event.currentTarget as HTMLElement;
  const codeBlock = button.closest('.code-block-wrapper')?.querySelector('code') as HTMLElement;
  if (!codeBlock) {
    console.error('未找到代码块');
    return;
  }

  const code = codeBlock.textContent || '';

  navigator.clipboard.writeText(code).then(() => {
    // 显示复制成功提示
    const originalHTML = button.innerHTML;
    button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20,6 9,17 4,12"></polyline>
      </svg>
    `;
    button.title = '已复制';

    setTimeout(() => {
      button.innerHTML = originalHTML;
      button.title = '复制代码';
    }, 2000);
  }).catch((err: Error) => {
    console.error('复制失败:', err);
    // 降级方案：选中文本
    const range = document.createRange();
    range.selectNode(codeBlock);
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
  });
}
