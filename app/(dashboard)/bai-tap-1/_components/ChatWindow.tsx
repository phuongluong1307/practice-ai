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
  assistantName?: string;
  onDiscordSend?: () => void;
  onFuelRequest?: () => void;
}
export default function ChatWindow({ messages, isLoading, status, assistantName = 'Minh', onDiscordSend, onFuelRequest }: ChatWindowProps) {
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
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100svh - 160px)'
        }}
      >
        <Empty 
          description={`Hãy bắt đầu cuộc trò chuyện với Cô ${assistantName}! 📚`} 
          style={{ marginBottom: 20 }}
        />
        {onFuelRequest && (
          <div style={{ textAlign: 'center', marginTop: -10 }}>
            <button
              onClick={onFuelRequest}
              className="quick-action-btn"
              style={{
                background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 auto',
                boxShadow: '0 4px 15px rgba(114, 46, 209, 0.3)',
              }}
            >
              <span style={{ fontSize: 20 }}>⛽</span>
              Tra cứu giá xăng ngay
            </button>
            <style>{`
              .quick-action-btn {
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              }
              .quick-action-btn:hover {
                transform: translateY(-2px) scale(1.02);
                box-shadow: 0 6px 20px rgba(114, 46, 209, 0.4);
                filter: brightness(1.1);
              }
              .quick-action-btn:active {
                transform: translateY(0) scale(1);
              }
            `}</style>
          </div>
        )}
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

        const toolInvocations = msg.parts?.filter(
          (p: any) => p.type.startsWith('tool-') || p.type === 'dynamic-tool' || p.type === 'tool-invocation'
        ) as any[];

        const displayContent = textContent;

        // Cho phép hiển thị nếu có text HOẶC có tool invocations
        if (isLast && isAssistant && isStreaming && !displayContent && (!toolInvocations || toolInvocations.length === 0)) {
          return null;
        }

        const hasFuelResult = isAssistant && (
          (msg as any).parts?.some(
            (p: any) => p.type === 'tool-invocation' && p.toolName === 'get_fuel_prices' && p.state === 'result'
          ) || 
          displayContent.includes('Giá Xăng Trong Nước') || 
          displayContent.includes('Giá Dầu Quốc Tế')
        );

        return (
          <ChatMessage
            key={msg.id}
            role={msg.role as 'user' | 'assistant'}
            content={displayContent}
            isStreaming={isLast && isAssistant && isStreaming}
            assistantName={assistantName}
            showDiscordButton={!!onDiscordSend && !!hasFuelResult && !isStreaming}
            onDiscordSend={onDiscordSend}
            toolInvocations={toolInvocations}
          />
        );
      })}

      {/* Typing indicator: hiện khi vừa gửi (submitted) HOẶC đang streaming nhưng bot CHƯA có text và CHƯA có tool nào hiện lên */}
      {(isSubmitted || (isStreaming && !lastMsgText && (!lastMsg?.parts?.some((p: any) => p.type.startsWith('tool-') || p.type === 'dynamic-tool' || p.type === 'tool-invocation')))) && (
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
