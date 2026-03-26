'use client';

import { useEffect, useRef } from 'react';
import { Empty, Avatar } from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import ChatMessage from './ChatMessage';
import type { UIMessage } from 'ai';

interface ChatWindowProps {
  messages: UIMessage[];
  isLoading?: boolean;
  status?: string;
}
export default function ChatWindow({ messages, isLoading, status }: ChatWindowProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const lastMsg = messages[messages.length - 1];
  let lastMsgText = (lastMsg as any)?.content || '';
  if (!lastMsgText && lastMsg?.parts) {
    lastMsgText = lastMsg.parts
      .filter((p: any) => p.type === 'text')
      .map((p: any) => p.text)
      .join('');
  }

  // ===== AUTO SCROLL: dùng setInterval brute-force =====
  // Chạy liên tục mỗi 60ms khi đang loading (streaming/submitted)
  // Dừng lại 3 giây sau khi streaming kết thúc (để typewriter gõ nốt)
  const statusRef = useRef(status);
  statusRef.current = status;

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let stopTimer: ReturnType<typeof setTimeout> | null = null;
    let scrollInterval: ReturnType<typeof setInterval> | null = null;

    const startScrolling = () => {
      if (scrollInterval) return; // đã chạy rồi
      scrollInterval = setInterval(() => {
        container.scrollTop = container.scrollHeight;
      }, 60);
    };

    const stopScrolling = () => {
      if (scrollInterval) {
        clearInterval(scrollInterval);
        scrollInterval = null;
      }
    };

    const isActive = status === 'streaming' || status === 'submitted';

    if (isActive) {
      // Bắt đầu scroll ngay
      if (stopTimer) {
        clearTimeout(stopTimer);
        stopTimer = null;
      }
      startScrolling();
    } else {
      // Streaming đã dừng → tiếp tục scroll thêm 3s cho typewriter gõ nốt
      stopTimer = setTimeout(() => {
        stopScrolling();
        // Scroll 1 lần cuối để chắc chắn
        container.scrollTop = container.scrollHeight;
      }, 3000);

      // Vẫn giữ scrolling trong 3s chờ typewriter
      startScrolling();
    }

    return () => {
      stopScrolling();
      if (stopTimer) clearTimeout(stopTimer);
    };
  }, [status, messages.length]);

  if (messages.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100svh - 160px)'
        }}
      >
        <Empty description="Hãy bắt đầu cuộc trò chuyện với Cô Minh! 📚" />
      </div>
    );
  }

  const isSubmitted = status === 'submitted';
  const isStreaming = status === 'streaming';

  return (
    <div
      ref={scrollContainerRef}
      style={{
        height: '100%',
        overflowY: 'auto',
        padding: '24px 16px',
        backgroundColor: '#f9f9f9',
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
        }}
      >
      {messages.map((msg, index) => {
        let textContent = (msg as any).content || '';
        if (!textContent && msg.parts && msg.parts.length > 0) {
          textContent = msg.parts
            .filter((part: any) => part.type === 'text')
            .map((part: any) => part.text)
            .join('');
        }

        const isLast = index === messages.length - 1;
        const isAssistant = msg.role === 'assistant';

        const displayContent = textContent;

        if (isLast && isAssistant && isStreaming && !displayContent) {
          return null;
        }

        return (
          <ChatMessage
            key={msg.id}
            role={msg.role as 'user' | 'assistant'}
            content={displayContent}
            isStreaming={isLast && isAssistant && isStreaming}
          />
        );
      })}

      {/* Typing indicator: hiện khi vừa gửi (submitted) HOẶC đang streaming nhưng bot chưa có text */}
      {(isSubmitted || (isStreaming && !lastMsgText)) && (
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'flex-start',
            marginBottom: 16,
          }}
        >
          <Avatar
            icon={<RobotOutlined />}
            style={{ backgroundColor: '#722ed1', flexShrink: 0 }}
          />
          <div
            style={{
              display: 'flex',
              padding: '14px 18px',
              backgroundColor: '#f0f0f0',
              borderRadius: 12,
              width: 'fit-content',
              gap: 4,
              alignItems: 'center',
            }}
          >
            <div className="typing-dot" style={{ animationDelay: '0s' }}></div>
            <div className="typing-dot" style={{ animationDelay: '0.2s' }}></div>
            <div className="typing-dot" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      )}

        <div style={{ height: 1 }} />
      </div>

      <style>{`
        .typing-dot {
          width: 8px;
          height: 8px;
          background-color: #90949c;
          border-radius: 50%;
          animation: typingBounce 1.4s infinite ease-in-out both;
        }
        @keyframes typingBounce {
          0%, 80%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          40% {
            transform: translateY(-6px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
