import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { Area, ResponsiveContainer, YAxis, Line, ComposedChart } from 'recharts';
import { X, Download, Copy, Check, Share2, MapPin, Calendar, Heart, User, ArrowUp, ArrowDown } from 'lucide-react';
import { formatDuration, formatDepth, isIOS } from '@/utils';
import type { Dive } from '@/types';

interface ShareCardProps {
  dive: Dive;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 分享卡片组件 - 生成可分享的潜水记录图片
 */
export function ShareCard({ dive, isOpen, onClose }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isIOSDevice] = useState(() => isIOS());

  // 简化 profile 数据用于小图表
  const chartData = useMemo(() => {
    const profile = dive.profile;
    if (!profile || profile.length === 0) return [];
    const step = Math.max(1, Math.floor(profile.length / 50));
    return profile
      .filter((_, i) => i % step === 0)
      .map(p => ({ depth: p.depth, heartRate: p.heartRate }));
  }, [dive.profile]);

  const hasHeartRateData = useMemo(() => {
    return chartData.some(p => p.heartRate != null);
  }, [chartData]);

  const locationText = dive.site !== dive.location 
    ? `${dive.location} · ${dive.site}` 
    : dive.site;

  // 生成图片
  const generateImage = useCallback(async () => {
    if (!cardRef.current || generatedImageUrl) return;
    try {
      const dataUrl = await toPng(cardRef.current, {
        backgroundColor: '#0f1419',
        pixelRatio: 3,
      });
      setGeneratedImageUrl(dataUrl);
    } catch (err) {
      console.error('Failed to generate image:', err);
    }
  }, [generatedImageUrl]);

  // 打开时自动生成图片
  useEffect(() => {
    if (isOpen && !generatedImageUrl) {
      // 延迟确保 Recharts 完全渲染
      const timer = setTimeout(() => {
        generateImage();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, generatedImageUrl, generateImage]);

  // 关闭时清理
  useEffect(() => {
    if (!isOpen) {
      setGeneratedImageUrl(null);
      setCopied(false);
    }
  }, [isOpen]);

  // 下载图片
  const handleDownload = useCallback(() => {
    if (!generatedImageUrl) return;
    const link = document.createElement('a');
    link.download = `dive-${dive.diveNumber}-${dive.date}.png`;
    link.href = generatedImageUrl;
    link.click();
  }, [generatedImageUrl, dive.diveNumber, dive.date]);

  // 复制到剪贴板
  const handleCopy = useCallback(async () => {
    if (!generatedImageUrl) return;
    try {
      const response = await fetch(generatedImageUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      handleDownload();
    }
  }, [generatedImageUrl, handleDownload]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-dive-surface border border-dive-border rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-dive-border">
          <h2 className="text-cyan-400 font-semibold text-lg flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Dive
          </h2>
          <button
            onClick={onClose}
            className="text-dive-text-muted hover:text-dive-text transition-colors p-1"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {generatedImageUrl ? (
            // 显示生成的图片
            <img 
              src={generatedImageUrl} 
              alt="Dive Card" 
              className="w-full rounded-lg shadow-lg"
            />
          ) : (
            // Loading + 隐藏的卡片用于生成图片
            <>
              <div className="flex items-center justify-center py-16 text-dive-text-muted">
                Generating...
              </div>
              <div className="absolute -left-[9999px]">
                <div
                  ref={cardRef}
                  className="w-[360px] bg-gradient-to-br from-[#0f1419] to-[#1a2632] rounded-xl p-5 shadow-lg"
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <img 
                        src={`${import.meta.env.BASE_URL}favicon.svg`}
                        alt="Dive"
                        className="w-7 h-7"
                      />
                      <span className="text-xl font-bold text-white">DIVE #{dive.diveNumber}</span>
                    </div>
                <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-sm font-medium">
                  {dive.diveType}
                </span>
              </div>

              {/* Location & Date */}
              <div className="space-y-1 mb-5 text-gray-400">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span className="truncate">{locationText}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>{dive.date} {dive.startTime}</span>
                </div>
              </div>

              {/* Main Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-cyan-400">{formatDepth(dive.maxDepth)}</div>
                  <div className="text-xs text-gray-500 mt-1">Max Depth</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-400">{formatDuration(dive.duration)}</div>
                  <div className="text-xs text-gray-500 mt-1">Duration</div>
                </div>
              </div>

              {/* Secondary Stats Row */}
              <div className="flex items-center text-sm text-gray-400 mb-4">
                <div className="flex items-center gap-1">
                  <ArrowDown className="w-3.5 h-3.5 text-red-500" />
                  <span>{dive.ascentRateStats?.avgDescent?.toFixed(1) || '-'}</span>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <ArrowUp className="w-3.5 h-3.5 text-green-500" />
                  <span>{dive.ascentRateStats?.avgAscent ? Math.abs(dive.ascentRateStats.avgAscent).toFixed(1) : '-'}</span>
                </div>
                {dive.environment?.avgHeartRate && (
                  <div className="flex items-center gap-1 ml-4">
                    <Heart className="w-3.5 h-3.5 text-pink-400" />
                    <span>{dive.environment.avgHeartRate}</span>
                  </div>
                )}
                {dive.diver && (
                  <div className="flex items-center gap-1 ml-auto">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{dive.diver}</span>
                  </div>
                )}
              </div>

              {/* Depth Chart */}
              {chartData.length > 0 && (
                <div className="h-24 mb-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                      <defs>
                        <linearGradient id="shareCardDepthGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <YAxis yAxisId="depth" domain={['dataMin', 'dataMax']} reversed hide />
                      {hasHeartRateData && (
                        <YAxis yAxisId="heartRate" domain={['dataMin - 10', 'dataMax + 10']} hide orientation="right" />
                      )}
                      <Area
                        yAxisId="depth"
                        type="monotone"
                        dataKey="depth"
                        stroke="#22d3ee"
                        strokeWidth={2}
                        fill="url(#shareCardDepthGradient)"
                        isAnimationActive={false}
                      />
                      {hasHeartRateData && (
                        <Line
                          yAxisId="heartRate"
                          type="monotone"
                          dataKey="heartRate"
                          stroke="#f472b6"
                          strokeWidth={1.5}
                          dot={false}
                          isAnimationActive={false}
                        />
                      )}
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <span className="text-xs text-cyan-500 font-mono tracking-tight">
                  https://divelogs.me?diveNumber={dive.diveNumber}
                </span>
                <img 
                  src={`${import.meta.env.BASE_URL}favicon.svg`}
                  alt="Dive"
                  className="w-4 h-4"
                />
              </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer - iOS vs 非 iOS */}
        <div className="px-4 pb-4">
          {isIOSDevice ? (
            <p className="text-gray-400 text-sm text-center">Long press image to save</p>
          ) : (
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCopy}
                disabled={!generatedImageUrl}
                className="flex items-center gap-2 px-4 py-2 bg-dive-card hover:bg-dive-hover text-dive-text rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={handleDownload}
                disabled={!generatedImageUrl}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 分享按钮组件
 */
export function ShareButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-cyan-400 hover:text-cyan-300 hover:bg-dive-card/50 rounded-lg transition-all"
      title="Share"
      aria-label="Share dive record"
    >
      <Share2 className="w-4 h-4" />
      <span className="hidden sm:inline">Share</span>
    </button>
  );
}
