'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Hook tạo hiệu ứng typewriter - hiện từng từ một cách mượt mà
 * @param fullText - Toàn bộ text đã nhận từ stream
 * @param isStreaming - Có đang streaming hay không (dùng để xác định tin nhắn mới tải hay cũ)
 * @param wordsPerTick - Số từ hiển thị mỗi tick (mặc định 2)
 * @param intervalMs - Thời gian giữa mỗi tick (mặc định 30ms)
 */
export function useTypewriter(
  fullText: string,
  isStreaming: boolean,
  wordsPerTick: number = 2,
  intervalMs: number = 30
): string {
  // Đánh dấu tin nhắn này là cũ nếu nó đã có nội dung và KHÔNG streaming ngay lần render đầu tiên
  const isHistoryMessageRef = useRef(!isStreaming && fullText.length > 0);
  
  const wordsRef = useRef<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cập nhật isStreaming mapping để interval có thể lấy giá trị mới nhất mà không render lại effect
  const isStreamingRef = useRef(isStreaming);
  useEffect(() => {
    isStreamingRef.current = isStreaming;
  }, [isStreaming]);

  // Tách text thành mảng các từ (giữ khoảng trắng/xuống dòng)
  const allWords = fullText.split(/(\s+)/);
  wordsRef.current = allWords;
  
  const [displayedWordCount, setDisplayedWordCount] = useState(() => 
    isHistoryMessageRef.current ? allWords.length : 0
  );

  useEffect(() => {
    if (isHistoryMessageRef.current) {
      return;
    }

    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        const target = wordsRef.current.length;
        
        setDisplayedWordCount((prev) => {
          const next = Math.min(prev + wordsPerTick, target);
          
          // Khi đã hiển thị toàn bộ VÀ không còn streaming từ API nữa -> dừng interval
          if (next >= target && !isStreamingRef.current) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          }
          
          return next;
        });
      }, intervalMs);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [wordsPerTick, intervalMs]);

  // Khi là tin nhắn cũ (tin nhắn lịch sử), trả về full text luôn
  if (isHistoryMessageRef.current) {
    return fullText;
  }

  return allWords.slice(0, displayedWordCount).join('');
}
