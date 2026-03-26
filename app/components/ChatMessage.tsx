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

  // Áp dụng typewriter cho tin nhắn assistant
  // (Hook useTypewriter sẽ tự động bỏ qua nếu là tin nhắn cũ dựa trên isStreaming ban đầu)
  const displayText = useTypewriter(
    content,
    !isUser && (isStreaming !== undefined ? isStreaming : true),
    2,  // 2 từ mỗi tick
    30  // 30ms mỗi tick → mượt mà, nhanh vừa
  );

  // isStillTyping: khi chưa hiện hết nội dung
  const isStillTyping = !isUser && displayText.length < content.length;

  // Hàm parse chữ có chứa ** để in đậm
  const renderTextWithBold = (text: string) => {
    // Tách chuỗi bằng Regex để lấy các đoạn nằm trong **...**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, index) => {
      // Nếu là chuỗi in đậm hoàn chỉnh (bắt đầu và kết thúc bằng **)
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      // Khúc text bình thường
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 16,
        gap: 8,
        alignItems: 'flex-start',
      }}
    >
      {!isUser && (
        <Avatar
          icon={<RobotOutlined />}
          style={{ backgroundColor: '#722ed1', flexShrink: 0 }}
        />
      )}
      <div
        style={{
          maxWidth: '70%',
          padding: '10px 16px',
          borderRadius: 12,
          backgroundColor: isUser ? '#1677ff' : '#f0f0f0',
          color: isUser ? '#fff' : '#000',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          lineHeight: 1.6,
        }}
      >
        <Text style={{ color: isUser ? '#fff' : '#000' }}>
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
      {isUser && (
        <Avatar
          icon={<UserOutlined />}
          style={{ backgroundColor: '#1677ff', flexShrink: 0 }}
        />
      )}
    </div>
  );
}
