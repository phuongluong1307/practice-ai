'use client';

import { Avatar, Typography } from 'antd';
import { UserOutlined, RobotOutlined } from '@ant-design/icons';
import { useTypewriter } from '@/app/hooks/useTypewriter';

const { Text } = Typography;

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export default function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const isUser = role === 'user';

  const displayText = useTypewriter(
    content,
    !isUser && (isStreaming !== undefined ? isStreaming : true),
    2,
    30
  );

  const isStillTyping = !isUser && displayText.length < content.length;

  const renderTextWithBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 20,
        gap: 10,
        alignItems: 'flex-start',
      }}
    >
      {/* Avatar bên trái cho assistant */}
      {!isUser && (
        <Avatar
          icon={<RobotOutlined />}
          size={38}
          style={{
            backgroundColor: '#722ed1',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(114, 46, 209, 0.3)',
          }}
        />
      )}

      {/* Nội dung tin nhắn */}
      <div style={{ maxWidth: '70%', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Tên role */}
        <Text
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: isUser ? '#1677ff' : '#722ed1',
            textAlign: isUser ? 'right' : 'left',
            paddingLeft: isUser ? 0 : 4,
            paddingRight: isUser ? 4 : 0,
          }}
        >
          {isUser ? 'Bạn' : 'Cô Minh 📚'}
        </Text>

        {/* Bóng chat */}
        <div
          style={{
            padding: '12px 16px',
            borderRadius: isUser
              ? '16px 16px 4px 16px'   /* User: bo tròn trừ góc dưới-phải */
              : '16px 16px 16px 4px',   /* Assistant: bo tròn trừ góc dưới-trái */
            background: isUser
              ? 'linear-gradient(135deg, #1677ff 0%, #4096ff 100%)'
              : '#ffffff',
            color: isUser ? '#fff' : '#2c2c2c',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            lineHeight: 1.7,
            boxShadow: isUser
              ? '0 2px 12px rgba(22, 119, 255, 0.25)'
              : '0 1px 8px rgba(0, 0, 0, 0.08)',
            border: isUser ? 'none' : '1px solid #f0f0f0',
          }}
        >
          <Text style={{ color: isUser ? '#fff' : '#2c2c2c' }}>
            {renderTextWithBold(isUser ? content : displayText)}
            {(isStreaming || isStillTyping) && (
              <span
                className="streaming-cursor"
                style={{
                  display: 'inline-block',
                  width: 2,
                  height: '1em',
                  backgroundColor: isUser ? '#fff' : '#722ed1',
                  marginLeft: 2,
                  verticalAlign: 'text-bottom',
                }}
              />
            )}
          </Text>
          {(isStreaming || isStillTyping) && (
            <style>{`
              @keyframes blinkCursor {
                0%, 100% { opacity: 1; }
                50% { opacity: 0; }
              }
              .streaming-cursor {
                animation: blinkCursor 0.8s step-end infinite;
              }
            `}</style>
          )}
        </div>
      </div>

      {/* Avatar bên phải cho user */}
      {isUser && (
        <Avatar
          icon={<UserOutlined />}
          size={38}
          style={{
            backgroundColor: '#1677ff',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(22, 119, 255, 0.3)',
          }}
        />
      )}
    </div>
  );
}
