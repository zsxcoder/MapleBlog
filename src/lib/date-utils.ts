/**
 * 日期工具函数
 * 提供日期格式化、解析等功能
 */

/**
 * 格式化日期为本地日期字符串
 * @param date 日期对象或日期字符串
 * @param options 格式化选项
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | string | undefined, options: Intl.DateTimeFormatOptions = {}): string {
  if (!date) return '未知日期';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return '无效日期';
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  return dateObj.toLocaleDateString('zh-CN', { ...defaultOptions, ...options });
}

/**
 * 获取日期的年份
 * @param date 日期对象或日期字符串
 * @returns 年份，如果日期无效则返回当前年份
 */
export function getYear(date: Date | string | undefined): number {
  if (!date) return new Date().getFullYear();
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return new Date().getFullYear();
  
  return dateObj.getFullYear();
}

/**
 * 获取相对时间描述
 * @param date 日期对象或日期字符串
 * @returns 相对时间描述，如 "3天前"
 */
export function getRelativeTime(date: Date | string | undefined): string {
  if (!date) return '未知时间';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return '无效时间';
  
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);
  
  if (diffYears > 0) return `${diffYears}年前`;
  if (diffMonths > 0) return `${diffMonths}个月前`;
  if (diffDays > 0) return `${diffDays}天前`;
  if (diffHours > 0) return `${diffHours}小时前`;
  if (diffMins > 0) return `${diffMins}分钟前`;
  return '刚刚';
}
