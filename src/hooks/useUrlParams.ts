import { useEffect } from 'react';
import { useDiveStore } from '@/store';

/**
 * 处理 URL 参数
 * 支持 ?diveNumber=1 来自动选中指定的潜水记录
 * 支持 ?layout=mobile 或 ?layout=desktop 来强制指定布局
 * 支持 ?diver=xxx 来筛选指定潜水员的记录
 * @returns { forceLayout }
 */
export function useUrlParams(): { forceLayout: 'mobile' | 'desktop' | null } {
  const { dives, setSelectedDiveId, setFilterDiver } = useDiveStore();
  
  // 检查 URL 参数
  const params = new URLSearchParams(window.location.search);
  const diveNumberParam = params.get('diveNumber');
  const layoutParam = params.get('layout');
  const diverParam = params.get('diver');
  const forceLayout = layoutParam === 'mobile' || layoutParam === 'desktop' ? layoutParam : null;

  // 处理潜水员筛选（不区分大小写）
  useEffect(() => {
    if (diverParam) {
      const lowerDiverParam = diverParam.toLowerCase();
      const matchedDiver = dives.find(
        (d) => d.diver?.toLowerCase() === lowerDiverParam
      )?.diver;
      if (matchedDiver) {
        setFilterDiver(matchedDiver);
      }
    }
  }, [diverParam, dives, setFilterDiver]);

  // 处理潜水记录选择
  useEffect(() => {
    if (diveNumberParam) {
      const diveNumber = parseInt(diveNumberParam, 10);
      if (!isNaN(diveNumber)) {
        const dive = dives.find((d) => d.diveNumber === diveNumber);
        if (dive) {
          setSelectedDiveId(dive.id);
        }
      }
    }
  }, [dives, setSelectedDiveId, diveNumberParam]);
  
  return { forceLayout };
}
