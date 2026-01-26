'use client';

import { useState, useEffect } from 'react';
import { Mail, MapPin, Link as LinkIcon, Code2, Terminal, Cpu, Compass, Send, MessageCircle } from 'lucide-react';

// 模拟配置数据 - 复刻自原仓库
const AUTHOR_PROFILE = {
  name: '钟神秀',
  avatar: 'https://home.zsxcoder.top/api/avatar.png',
  role: '博客写作者',
  location: '江苏, 中国',
  blogContent: '在这个博客分享我的生活日常、踩坑教程和资源分享。',
  birthYear: 2005,
  mbti: 'INFJ',
  locationDescription: '是中国古代文明的发祥地之一，文化及教育事业亦相当发达。',
  locationPatterns: {
    show: true,
    opacity: 0.15
  },
  skills: {
    programmingLanguages: ['JavaScript', 'TypeScript', 'Python', 'Go'],
    frameworks: ['Next.js', 'React', 'Nest.js', 'Astro'],
    tools: ['Git', 'Docker', 'Vercel', 'Cloudflare']
  },
  socialLinks: [
    {
      name: 'GitHub',
      url: 'https://github.com/zsxcoder',
      icon: 'Github'
    },
    {
      name: 'email',
      url: 'mailto:3149261770@qq.com',
      icon: 'Mail'
      },
    {
      name: 'Telegram',
      url: 'https://t.me/zsxcoderchat_bat',
      icon: 'Send'
      },
    {
      name: 'QQ',
      url: 'https://qm.qq.com/q/eLZhXoSonY',
      icon: 'MessageCircle'
      },
  ]
};

// Lucide React 图标映射
const lucideIconMap: Record<string, any> = {
  Mail,
  Send,
  MessageCircle,
};

// 渲染图标组件
const renderIcon = (iconName: string, size: number = 16, className: string = '') => {
  // 使用 Lucide React 图标
  const LucideIcon = lucideIconMap[iconName] || LinkIcon;
  return <LucideIcon size={size} className={className} />;
};

interface AuthorCardProps {
  className?: string;
}

export default function AuthorCard({ className = '' }: AuthorCardProps) {
  // 计算年龄（用于Lv等级）
  const calculateAge = () => {
    if (!AUTHOR_PROFILE.birthYear) return 0;
    const currentYear = new Date().getFullYear();
    return currentYear - AUTHOR_PROFILE.birthYear;
  };

  const age = calculateAge();

  const handleCopyDouyinId = async (douyinId: string | undefined) => {
    if (!douyinId) {
      console.error('无法获取抖音号 ID');
      return;
    }

    let success = false;

    // 1. Try Modern Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(douyinId);
        success = true;
      } catch (err) {
        console.warn('Clipboard API failed', err);
      }
    }

    // 2. Try Legacy execCommand
    if (!success) {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = douyinId;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        // For iOS
        if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
          const range = document.createRange();
          range.selectNodeContents(textArea);
          const selection = window.getSelection();
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
          }
          textArea.setSelectionRange(0, 999999);
        }

        // 使用类型断言解决已弃用API的TypeScript警告
        success = (document as any).execCommand('copy');
        document.body.removeChild(textArea);
      } catch (err) {
        console.warn('execCommand failed', err);
      }
    }

    // 3. Feedback
    if (success) {
      // 这里没有使用state，所以不显示反馈
    } else {
      // Fallback: Show prompt for manual copy
      const shouldCopy = window.confirm(`复制失败，是否手动复制？\n抖音号：${douyinId}`);
      if (shouldCopy) {
        window.prompt("请复制以下抖音号：", douyinId);
      }
    }
  };

  // 关于页面的信息卡片 - Genshin Namecard Style with Liquid Glass Effect
  return (
    <div className={`relative w-full flex flex-col md:flex-row items-stretch gap-0 shadow-xl
        group ${className}`}
        style={{
            background: 'linear-gradient(135deg, rgba(211, 188, 142, 0.3) 0%, rgba(163, 135, 83, 0.3) 50%, rgba(211, 188, 142, 0.3) 100%)',
            backdropFilter: 'blur-md',
            padding: '2px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
        }}>
        {/* 内容容器 - 使用液态玻璃样式 */}
        <div className="relative w-full flex flex-col md:flex-row items-stretch gap-0 bg-gradient-to-r from-white/60 to-slate-50/60 backdrop-blur-lg border border-white/30">
            {/* 边框装饰层 */}
            <div className="absolute inset-0 pointer-events-none z-[1]">
                {/* 四角装饰 - 更大的装饰角 */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-[#d3bc8e]"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-[#d3bc8e]"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-[#d3bc8e]"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-[#d3bc8e]"></div>

                {/* 边框装饰线条 - 渐变效果 */}
                <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-[#d3bc8e]/40 to-transparent"></div>
                <div className="absolute bottom-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-[#d3bc8e]/40 to-transparent"></div>
                <div className="absolute left-0 top-8 bottom-8 w-[1px] bg-gradient-to-b from-transparent via-[#d3bc8e]/40 to-transparent"></div>
                <div className="absolute right-0 top-8 bottom-8 w-[1px] bg-gradient-to-b from-transparent via-[#d3bc8e]/40 to-transparent"></div>

                {/* 内部装饰图案 - 小方块 */}
                <div className="absolute top-3 left-3 w-1.5 h-1.5 bg-[#d3bc8e]/30"></div>
                <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-[#d3bc8e]/30"></div>
                <div className="absolute bottom-3 left-3 w-1.5 h-1.5 bg-[#d3bc8e]/30"></div>
                <div className="absolute bottom-3 right-3 w-1.5 h-1.5 bg-[#d3bc8e]/30"></div>
            </div>

            {/* Left Decor / Avatar Section */}
            <div className="relative md:w-64 shrink-0 bg-white/40 backdrop-blur-lg flex flex-col items-center justify-between pt-8 px-8 pb-4 border-b md:border-b-0 md:border-r border-white/30 z-10 group/pisces">
                {/* Leo Constellation Pattern as Background - Genshin Style */}
                <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
                    <div className="relative w-full h-full max-w-[280px] max-h-[280px] opacity-25">
                        {/* 光晕效果 - 使用径向渐变 */}
                        <div
                            className="absolute inset-0 blur-2xl rounded-full"
                            style={{
                                background: 'radial-gradient(circle, rgba(211, 188, 142, 0.15) 0%, rgba(211, 188, 142, 0.05) 50%, transparent 100%)'
                            }}
                        ></div>

                        <svg
                            className="w-full h-full relative z-10"
                            viewBox="0 0 24 24"
                            fill="none"
                            preserveAspectRatio="xMidYMid meet"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            {/* 定义金色渐变（用于填充） */}
                            <defs>
                                <linearGradient id="leo-gold-light" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#f4e4bc" stopOpacity="0.9" />
                                    <stop offset="50%" stopColor="#d3bc8e" stopOpacity="1" />
                                    <stop offset="100%" stopColor="#a38753" stopOpacity="0.8" />
                                </linearGradient>
                                {/* 光晕滤镜 */}
                                <filter id="leo-glow">
                                    <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                                    <feMerge>
                                        <feMergeNode in="coloredBlur"/>
                                        <feMergeNode in="SourceGraphic"/>
                                    </feMerge>
                                </filter>
                            </defs>

                            {/* 狮子座图案 */}
                            <g fill-rule="evenodd">
                                <path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z"
                                      fill="url(#leo-gold-light)"
                                      filter="url(#leo-glow)"
                                      opacity="0.85"
                                />
                                <path d="M13.5 5A3.5 3.5 0 0 0 10 8.5c0 .223.058.515.185.94c.057.193.123.395.196.62l.018.056q.122.367.248.79c.328 1.116.615 2.506.352 4.18a4 4 0 1 1-2.298-3.707a30 30 0 0 0-.223-.704c-.072-.22-.145-.445-.21-.663C8.13 9.548 8 9.027 8 8.5a5.5 5.5 0 1 1 11 0c0 .957-.315 1.92-.713 2.808c-.401.894-.93 1.8-1.427 2.64l-.133.224c-.459.773-.88 1.484-1.202 2.147C15.165 17.061 15 17.61 15 18a2 2 0 1 0 4 0a1 1 0 1 1 2 0a4 4 0 0 1-8 0c0-.86.335-1.749.725-2.553c.36-.744.827-1.53 1.276-2.285l.139-.234c.502-.848.974-1.662 1.323-2.439c.352-.785.537-1.446.537-1.989C17 6.563 15.434 5 13.5 5M7 13a2 2 0 1 0 0 4a2 2 0 0 0 0-4"
                                      fill="url(#leo-gold-light)"
                                      filter="url(#leo-glow)"
                                      opacity="0.85"
                                />
                            </g>
                        </svg>
                    </div>
                </div>

                {/* Top Section: Avatar & Name */}
                <div className="flex flex-col items-center w-full z-10 pt-4">
                    <div className="relative group">
                    <div className="absolute inset-0 rounded-full bg-[#d3bc8e] opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
                    <div className="w-24 h-24 rounded-full border-2 border-[#d3bc8e] p-1 bg-white/30 backdrop-blur-md relative overflow-hidden">
                        <img
                            src={AUTHOR_PROFILE.avatar}
                            alt={AUTHOR_PROFILE.name}
                            className="w-full h-full rounded-full object-cover transition-transform duration-500 group-hover:scale-105"
                            style={{ borderRadius: '50%' }}
                        />
                    </div>
                    {/* Level Badge - 移到头像容器外部，避免被圆形边界裁切 */}
                    <div className="absolute -bottom-1 -right-1 bg-[#d3bc8e] text-[#2b2f3a] text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white z-20">
                        Lv.{age}
                    </div>
                </div>

                    <h3 className="text-xl font-bold text-slate-800 dark:text-black font-sans tracking-wider mt-4">
                        <span className="dark:text-black">
                            {AUTHOR_PROFILE.name}
                        </span>
                    </h3>

                    {/* MBTI Tag - Genshin Style */}
                        {AUTHOR_PROFILE.mbti && (
                        <div className="mt-3 relative group">
                            {/* 背景光效 */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[#d3bc8e]/20 via-[#a38753]/20 to-[#d3bc8e]/20 blur-sm opacity-50 group-hover:opacity-75 transition-opacity"></div>

                            {/* 主容器 */}
                            <div className="relative bg-gradient-to-br from-white/70 to-slate-50/70 backdrop-blur-md
                                border border-white/30
                                px-4 py-1.5 rounded-md
                                shadow-md shadow-[#d3bc8e]/10
                                group-hover:shadow-lg group-hover:shadow-[#d3bc8e]/20
                                transition-all duration-300">

                                {/* 装饰性边框 */}
                                <div className="absolute inset-0 rounded-md border border-[#d3bc8e]/20 pointer-events-none"></div>

                                {/* 顶部装饰线 */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-[1px] bg-gradient-to-r from-transparent via-[#d3bc8e]/50 to-transparent"></div>

                                {/* 文字 */}
                                <div className="relative flex items-center justify-center gap-1.5">
                                    {/* 左侧装饰点 */}
                                    <div className="w-1 h-1 rounded-full bg-[#d3bc8e]/60"></div>
                                    <span className="text-xs font-bold tracking-[0.2em] text-[#8c7b60] uppercase font-serif">
                                {AUTHOR_PROFILE.mbti}
                            </span>
                                    {/* 右侧装饰点 */}
                                    <div className="w-1 h-1 rounded-full bg-[#d3bc8e]/60"></div>
                                </div>

                                {/* 底部高光 */}
                                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#d3bc8e]/30 to-transparent rounded-b-md"></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Section: Location Card */}
                {AUTHOR_PROFILE.location && (() => {
                    const locationParts = AUTHOR_PROFILE.location.split(',').map(s => s.trim());
                    const city = locationParts[0] || '';
                    const country = locationParts[1] || 'China';

                    return (
                        <div className="w-full mt-8 z-10">
                            <div className="relative group cursor-default transition-all duration-300">
                                {/* Card Background with ornate border illusion */}
                                <div className="relative bg-white/70 backdrop-blur-md border border-white/30 rounded-lg p-1 shadow-sm overflow-hidden">
                                    {/* Inner styling */}
                                    <div className="bg-[#fdfbf7]/80 backdrop-blur-sm rounded border border-white/40 p-3 relative overflow-hidden">

                                        {/* Decorative corners */}
                                        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#d3bc8e]"></div>
                                        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#d3bc8e]"></div>
                                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#d3bc8e]"></div>
                                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#d3bc8e]"></div>

                                        <div className="relative flex items-center justify-between z-10 px-2 py-1">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-[#a38753] font-bold tracking-[0.2em] uppercase mb-0.5 flex items-center gap-1">
                                                    <Compass size={10} /> Region
                                                </span>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-2xl font-bold text-slate-700 font-serif leading-none tracking-wide group-hover:text-[#a38753] transition-colors duration-300">
                                                        {city.toUpperCase()}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{country}</span>
                                                </div>
                                                {AUTHOR_PROFILE.locationDescription && (
                                                    <div className="mt-2 pt-1.5 border-t border-[#d3bc8e]/40">
                                                        <span className="text-[11px] text-slate-500/90 font-medium tracking-widest font-sans">
                                                            {AUTHOR_PROFILE.locationDescription}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Icon Decoration */}
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d3bc8e]/10 to-white border border-[#d3bc8e]/30 flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform duration-500 ml-4">
                                                <MapPin className="text-[#a38753] drop-shadow-sm" size={20} fill="currentColor" fillOpacity={0.2} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Shadow/Glow effect */}
                                <div className="absolute -inset-0.5 bg-[#d3bc8e]/20 blur-md rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                            </div>
                        </div>
                    );
                })()}
            </div>

            {/* Right Content Section */}
            <div className="flex-1 pt-6 px-6 pb-4 md:pt-8 md:px-8 md:pb-4 relative z-10 bg-white/30 backdrop-blur-lg">
                {/* Constellation Decor Top Right */}
                <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                    <svg className="w-40 h-40 text-[#d3bc8e]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
                        <path d="M10,10 L90,90 M90,10 L10,90" strokeOpacity="0.5" />
                    </svg>
                </div>

                {/* Bio */}
                <div className="relative z-10 mb-6">
                    <div className="flex items-center gap-3 mb-3">
                        {AUTHOR_PROFILE.role && (
                            <span className="text-[10px] font-bold tracking-widest text-[#a38753] uppercase border border-[#d3bc8e]/40 px-2 py-0.5 rounded-sm">
                                {AUTHOR_PROFILE.role}
                            </span>
                        )}
                        <div className="h-px flex-1 bg-gradient-to-r from-[#d3bc8e]/30 to-transparent"></div>
                    </div>

                    {AUTHOR_PROFILE.blogContent && (
                        <div className="relative pr-32">
                        <div
                            className="text-sm text-slate-600 leading-relaxed font-sans"
                            dangerouslySetInnerHTML={{ __html: AUTHOR_PROFILE.blogContent }}
                        />
                            {/* Code Pattern Texture at blogContent Right */}
                            <div className="absolute top-0 right-0 opacity-5 pointer-events-none" style={{ opacity: 0.08 }}>
                                <div className="relative w-32 h-32 -top-2 -right-4">
                                    <Code2 size={128} className="text-[#a38753]" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Skills Section - Genshin Talent Style */}
                {AUTHOR_PROFILE.skills && (
                    <div className="mb-6 relative z-10">
                        <div className="flex flex-col gap-4">
                            {/* Programming Languages */}
                            {AUTHOR_PROFILE.skills.programmingLanguages && AUTHOR_PROFILE.skills.programmingLanguages.length > 0 && (
                                <div className="group/skill">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-1 rounded bg-[#d3bc8e]/10 text-[#a38753] group-hover/skill:bg-[#d3bc8e] group-hover/skill:text-white transition-colors">
                                            <Code2 size={12} />
                                        </div>
                                        <span className="text-[10px] font-bold text-[#8c7b60] uppercase tracking-wider">Languages</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {AUTHOR_PROFILE.skills.programmingLanguages.map((skill, i) => (
                                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-sm bg-white/70 backdrop-blur-md border border-white/30 hover:border-[#d3bc8e]/30 text-slate-600 cursor-default transition-all hover:scale-105">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Frameworks */}
                            {AUTHOR_PROFILE.skills.frameworks && AUTHOR_PROFILE.skills.frameworks.length > 0 && (
                                <div className="group/skill">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-1 rounded bg-[#d3bc8e]/10 text-[#a38753] group-hover/skill:bg-[#d3bc8e] group-hover/skill:text-white transition-colors">
                                            <Cpu size={12} />
                                        </div>
                                        <span className="text-[10px] font-bold text-[#8c7b60] uppercase tracking-wider">Frameworks</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {AUTHOR_PROFILE.skills.frameworks.map((skill, i) => (
                                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-sm bg-white/70 backdrop-blur-md border border-white/30 hover:border-[#d3bc8e]/30 text-slate-600 cursor-default transition-all hover:scale-105">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tools */}
                            {AUTHOR_PROFILE.skills.tools && AUTHOR_PROFILE.skills.tools.length > 0 && (
                                <div className="group/skill">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-1 rounded bg-[#d3bc8e]/10 text-[#a38753] group-hover/skill:bg-[#d3bc8e] group-hover/skill:text-white transition-colors">
                                            <Terminal size={12} />
                                        </div>
                                        <span className="text-[10px] font-bold text-[#8c7b60] uppercase tracking-wider">Tools</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {AUTHOR_PROFILE.skills.tools.map((skill, i) => (
                                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-sm bg-white/70 backdrop-blur-md border border-white/30 hover:border-[#d3bc8e]/30 text-slate-600 cursor-default transition-all hover:scale-105">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Social Links */}
                <div className="relative z-10 flex flex-wrap gap-1.5">
                    {AUTHOR_PROFILE.socialLinks?.map((social, index) => {
                        const isDouyin = social.name === '抖音' || (social as any).douyinId || social.name === 'tiktok';
                        const isEmail = social.name === 'email';
                        const isWeChat = social.name === 'wechat';
                        const isBilibili = social.name === 'bilibili';
                        const isGitHub = social.name === 'gitHub' || social.name === 'github';

                        // Compact Genshin Button Style
                        const btnClass = "relative group/btn flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm cursor-pointer transition-all duration-300 overflow-hidden";

                        // Handle WeChat - Hover to show QR
                        if (isWeChat) {
                            const wechatQR = (social as any).wechatQR;
                            return (
                                <div key={index} className="relative group/wechat">
                                    <button className={btnClass}>
                                        {/* 背景光效 */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#d3bc8e]/10 via-[#a38753]/5 to-[#d3bc8e]/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>

                                        {/* 主容器 */}
                                        <div className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm
                                            bg-gradient-to-br from-white/70 to-slate-50/70 backdrop-blur-md
                                            border border-white/30
                                            shadow-sm shadow-[#d3bc8e]/5
                                            group-hover/btn:border-[#d3bc8e]
                                            group-hover/btn:shadow-md group-hover/btn:shadow-[#d3bc8e]/20
                                            group-hover/btn:scale-105
                                            transition-all duration-300">

                                            {/* 装饰性边框 */}
                                            <div className="absolute inset-0 rounded-sm border border-[#d3bc8e]/10 pointer-events-none"></div>

                                            {/* 图标和文字 */}
                                            <div className="relative z-10 flex items-center gap-1.5">
                                                <div className="text-[#8c7b60] group-hover/btn:text-[#a38753] transition-colors">
                                        {renderIcon(social.icon, 14)}
                                                </div>
                                                <span className="text-[10px] font-medium tracking-wide text-[#8c7b60] group-hover/btn:text-[#a38753] transition-colors whitespace-nowrap">
                                                    {social.name}
                                                </span>
                                            </div>

                                            {/* 顶部高光 */}
                                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#d3bc8e]/30 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity rounded-t-sm"></div>
                                        </div>
                                    </button>

                                    {/* QR Code Popup */}
                                    {wechatQR && (
                                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 invisible group-hover/wechat:opacity-100 group-hover/wechat:visible transition-all duration-300 z-50">
                                            <div className="w-32 h-32 p-2 bg-white rounded-lg shadow-xl border border-[#d3bc8e]">
                                                <img
                                                    src={wechatQR}
                                                    alt="WeChat QR"
                                                    className="w-full h-full object-contain"
                                                />
                                                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-[#d3bc8e] rotate-45"></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        }

                        // Handle TikTok (Douyin) - Click to Copy
                        if (isDouyin) {
                            return (
                                <button key={index} onClick={() => handleCopyDouyinId((social as any).douyinId)} className={btnClass}>
                                    {/* 背景光效 */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#d3bc8e]/10 via-[#a38753]/5 to-[#d3bc8e]/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>

                                    {/* 主容器 */}
                                    <div className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm
                                        bg-gradient-to-br from-white/70 to-slate-50/70 backdrop-blur-md
                                        border border-white/30
                                        shadow-sm shadow-[#d3bc8e]/5
                                        group-hover/btn:border-[#d3bc8e]
                                        group-hover/btn:shadow-md group-hover/btn:shadow-[#d3bc8e]/20
                                        group-hover/btn:scale-105
                                        transition-all duration-300">

                                        {/* 装饰性边框 */}
                                        <div className="absolute inset-0 rounded-sm border border-[#d3bc8e]/10 pointer-events-none"></div>

                                        {/* 图标和文字 */}
                                        <div className="relative z-10 flex items-center gap-1.5">
                                            <div className="text-[#8c7b60] group-hover/btn:text-[#a38753] transition-colors">
                                    {renderIcon(social.icon, 14)}
                                            </div>
                                            <span className="text-[10px] font-medium tracking-wide text-[#8c7b60] group-hover/btn:text-[#a38753] transition-colors whitespace-nowrap">
                                                {social.name}
                                            </span>
                                        </div>

                                        {/* 顶部高光 */}
                                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#d3bc8e]/30 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity rounded-t-sm"></div>
                                    </div>
                                </button>
                            )
                        }

                        // Handle Bilibili, Email, GitHub - Normal Links
                        if (isBilibili || isEmail || isGitHub || social.url) {
                            return (
                                <a key={index} href={social.url} target="_blank" rel="noopener noreferrer" className={btnClass}>
                                    {/* 背景光效 */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#d3bc8e]/10 via-[#a38753]/5 to-[#d3bc8e]/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>

                                    {/* 主容器 */}
                                    <div className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm
                                        bg-gradient-to-br from-white/70 to-slate-50/70 backdrop-blur-md
                                        border border-white/30
                                        shadow-sm shadow-[#d3bc8e]/5
                                        group-hover/btn:border-[#d3bc8e]
                                        group-hover/btn:shadow-md group-hover/btn:shadow-[#d3bc8e]/20
                                        group-hover/btn:scale-105
                                        transition-all duration-300">

                                        {/* 装饰性边框 */}
                                        <div className="absolute inset-0 rounded-sm border border-[#d3bc8e]/10 pointer-events-none"></div>

                                        {/* 图标和文字 */}
                                        <div className="relative z-10 flex items-center gap-1.5">
                                            <div className="text-[#8c7b60] group-hover/btn:text-[#a38753] transition-colors">
                                    {renderIcon(social.icon, 14)}
                                            </div>
                                            <span className="text-[10px] font-medium tracking-wide text-[#8c7b60] group-hover/btn:text-[#a38753] transition-colors whitespace-nowrap">
                                                {social.name}
                                            </span>
                                        </div>

                                        {/* 顶部高光 */}
                                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#d3bc8e]/30 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity rounded-t-sm"></div>
                                    </div>
                                </a>
                            )
                        }

                        return null;
                    })}
                </div>
            </div>
        </div>
    </div>
);
}
