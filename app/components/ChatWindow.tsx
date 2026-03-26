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
  const contentRef = useRef<HTMLDivElement>(null);

  const lastMsg = messages[messages.length - 1];
  let lastMsgText = (lastMsg as any)?.content || '';
  if (!lastMsgText && lastMsg?.parts) {
    lastMsgText = lastMsg.parts
      .filter((p: any) => p.type === 'text')
      .map((p: any) => p.text)
      .join('');
  }

  const isUserScrollingRef = useRef(false);

  // Detect khi user tự scroll lên để đọc lại tin nhắn cũ
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      // Nếu user scroll cách bottom > 100px -> coi như đang đọc lại
      isUserScrollingRef.current = distanceFromBottom > 100;
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // ResizeObserver: theo dõi thay đổi kích thước content (do typewriter thêm từ)
  // Mỗi khi content cao lên -> auto scroll xuống bottom
  useEffect(() => {
    const container = scrollContainerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const observer = new ResizeObserver(() => {
      // Chỉ auto-scroll nếu user không đang tự scroll lên đọc lại
      if (!isUserScrollingRef.current) {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      }
    });

    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  // Scroll xuống khi có tin nhắn mới hoặc status thay đổi
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (status === 'streaming' || status === 'submitted') {
      isUserScrollingRef.current = false; // Reset khi bắt đầu stream mới
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  }, [messages.length, status]);

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
        ref={contentRef}
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
