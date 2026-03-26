'use client';

import { Input, Button, Space } from 'antd';
import { SendOutlined } from '@ant-design/icons';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
}

export default function ChatInput({
  input,
  setInput,
  onSend,
  isLoading,
}: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div
      style={{
        padding: '24px',
        backgroundColor: '#f9f9f9',
        borderTop: 'none',
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: '0 auto',
          position: 'relative',
          display: 'flex',
          gap: 8,
          backgroundColor: '#fff',
          padding: '8px 8px 8px 16px',
          borderRadius: 24,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          border: '1px solid #e5e5e5',
        }}
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhắn tin cho Cô Minh..."
          variant="borderless"
          size="large"
          disabled={isLoading}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            padding: '4px 0',
          }}
        />
        <Button
          type="primary"
          size="large"
          shape="circle"
          icon={<SendOutlined />}
          loading={isLoading}
          disabled={!input.trim()}
          onClick={onSend}
          style={{
            width: 40,
            height: 40,
            minWidth: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />
      </div>
    </div>
  );
}
