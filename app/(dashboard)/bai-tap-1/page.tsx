'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { Typography } from 'antd';
import ChatWindow from '@/app/components/ChatWindow';
import ChatInput from '@/app/components/ChatInput';

const { Title } = Typography;

export default function BaiTap1Page() {
  const [input, setInput] = useState('');
  const { messages, setMessages, sendMessage, status } = useChat({
    experimental_throttle: 50,
    onError: (e) => {
      console.error("useChat error:", e);
      // Khi có lỗi, đính kèm 1 tin nhắn thông báo lỗi thẳng vào danh sách chat history
      setMessages((prev: any) => [
        ...prev,
        {
          id: String(Date.now()),
          role: 'assistant',
          content: 'Có gì đó không ổn rồi 😅 Let’s try again nha em!',
        }
      ]);
    }
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    sendMessage({ text: trimmed });
    setInput('');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#f9f9f9',
      }}
    >
      {/* Header - cùng height 64px với sidebar title */}
      <div
        style={{
          height: 64,
          minHeight: 64,
          padding: '0 24px',
          borderBottom: '1px solid #e5e5e5',
          backgroundColor: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Title level={4} style={{ margin: 0, fontSize: 18, color: '#1f1f1f' }}>
          💬 Cô Minh English
        </Title>
      </div>

      {/* Chat Window - chỉ khu vực này scroll */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <ChatWindow messages={messages} isLoading={isLoading} status={status} />
      </div>

      {/* Chat Input - cố định ở dưới */}
      <div style={{ flexShrink: 0 }}>
        <ChatInput
          input={input}
          setInput={setInput}
          onSend={handleSend}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
