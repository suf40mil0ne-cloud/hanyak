import { useEffect } from 'react';

/** 페이지별 document.title 동적 설정 */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
