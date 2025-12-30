import { useEffect } from 'react';
import { useDiveStore } from '@/store';

/**
 * 处理 URL 参数
 * 支持 ?diveNumber=1 来自动选中指定的潜水记录
 * @returns 是否有 diveNumber 参数
 */
export function useUrlParams(): boolean {
  const { dives, setSelectedDiveId } = useDiveStore();
  
  // 检查 URL 是否有 diveNumber 参数
  const params = new URLSearchParams(window.location.search);
  const diveNumberParam = params.get('diveNumber');
  const hasDiveNumberParam = !!diveNumberParam;

  useEffect(() => {
    if (diveNumberParam) {
      const diveNumber = parseInt(diveNumberParam, 10);
      if (!isNaN(diveNumber)) {
        // 查找匹配的 dive
        const dive = dives.find((d) => d.diveNumber === diveNumber);
        if (dive) {
          setSelectedDiveId(dive.id);
        }
      }
    }
  }, [dives, setSelectedDiveId, diveNumberParam]);
  
  return hasDiveNumberParam;
}
