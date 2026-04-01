'use client';

import { useState, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Typography, Button, Tooltip, Input, Card, Space, message, Alert } from 'antd';
import { ApiOutlined, CheckCircleOutlined, LockOutlined } from '@ant-design/icons';
import ChatWindow from '@/app/(dashboard)/bai-tap-1/_components/ChatWindow';
import ChatInput from '@/app/(dashboard)/bai-tap-1/_components/ChatInput';

const { Title, Text } = Typography;

export default function BaiTap6Page() {
  const [input, setInput] = useState('');
  const [webhookUrl, setWebhookUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('discord_webhook_url') || '';
    }
    return '';
  });
  const [isValidated, setIsValidated] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('discord_webhook_url');
    }
    return false;
  });
  const [isChecking, setIsChecking] = useState(false);

  // Đồng bộ hóa lại nếu cần (ví dụ: khi tab khác thay đổi localStorage)
  useEffect(() => {
    const saved = localStorage.getItem('discord_webhook_url');
    if (saved && saved !== webhookUrl) {
      setWebhookUrl(saved);
      setIsValidated(true);
    }
  }, [webhookUrl]);

  const { messages, setMessages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/fuel' }),
    experimental_throttle: 50,
    onError: (e: any) => {
      console.error('useChat error:', e);
      setMessages((prev: any) => [
        ...prev,
        {
          id: String(Date.now()),
          role: 'assistant',
          content: 'Ối! Kiều bị lỗi rồi 😭 Thử lại nha bạn ơi!',
        },
      ]);
    },
  } as any);

  const isLoading = status === 'submitted' || status === 'streaming';

  const validateWebhook = () => {
    if (!webhookUrl) {
      message.error('Đại ca vui lòng nhập Webhook URL nhé!');
      return;
    }

    const discordRegex = /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w-]+$/;
    if (!discordRegex.test(webhookUrl)) {
      message.error('URL không đúng định dạng Discord Webhook rồi đại ca ơi!');
      return;
    }

    setIsChecking(true);
    // Giả lập check hoặc có thể gửi thử 1 tin nhắn test
    setTimeout(() => {
      localStorage.setItem('discord_webhook_url', webhookUrl);
      setIsValidated(true);
      setIsChecking(false);
      message.success('Xác thực Webhook thành công! Chào mừng đại ca!');
    }, 1000);
  };

  const handleLogoutWebhook = () => {
    localStorage.removeItem('discord_webhook_url');
    setWebhookUrl('');
    setIsValidated(false);
    setMessages([]);
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    // Lấy webhookUrl mới nhất từ localStorage trước khi gửi
    const latestWebhook = localStorage.getItem('discord_webhook_url') || '';
    
    sendMessage({ text: trimmed }, { body: { webhookUrl: latestWebhook } });
    setInput('');
  };

  const handleClearChat = () => {
    setMessages([]);
    setInput('');
  };

  const handleSendDiscord = () => {
    if (isLoading) return;
    const latestWebhook = localStorage.getItem('discord_webhook_url') || '';
    sendMessage({ text: 'Gửi báo cáo giá xăng lên Discord' }, { body: { webhookUrl: latestWebhook } });
  };

  const handleFuelRequest = () => {
    if (isLoading) return;
    const latestWebhook = localStorage.getItem('discord_webhook_url') || '';
    sendMessage({ text: 'Lấy thông tin giá xăng mới nhất' }, { body: { webhookUrl: latestWebhook } });
  };

  // Giao diện nhập Webhook
  if (!isValidated) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          padding: 20,
        }}
      >
        <Card
          style={{
            maxWidth: 500,
            width: '100%',
            borderRadius: 24,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            border: 'none',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div
              style={{
                width: 80,
                height: 80,
                background: '#722ed1',
                borderRadius: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 8px 16px rgba(114, 46, 209, 0.3)',
              }}
            >
              <LockOutlined style={{ fontSize: 40, color: 'white' }} />
            </div>
            <Title level={2} style={{ margin: 0, color: '#1f1f1f' }}>
              Xác Thực Truy Cập
            </Title>
            <Text type="secondary">Vui lòng nhập Discord Webhook để bắt đầu tra cứu giá xăng</Text>
          </div>

          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                Discord Webhook URL
              </Text>
              <Input
                prefix={<ApiOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="https://discord.com/api/webhooks/..."
                size="large"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                style={{ borderRadius: 12 }}
              />
            </div>

            <Alert
              message="Tại sao cần cái này?"
              description="Để Kiều có thể gửi báo cáo trực tiếp vào kênh Discord của đại ca đó!"
              type="info"
              showIcon
              style={{ borderRadius: 12 }}
            />

            <Button
              type="primary"
              size="large"
              block
              loading={isChecking}
              onClick={validateWebhook}
              style={{
                height: 50,
                borderRadius: 12,
                background: '#722ed1',
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              Bắt đầu tra cứu ngay
            </Button>
          </Space>
        </Card>
      </div>
    );
  }

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
      {/* Header */}
      <div
        style={{
          height: 64,
          minHeight: 64,
          padding: '0 24px',
          borderBottom: '1px solid #e5e5e5',
          backgroundColor: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div />
        
        <Title level={4} style={{ margin: 0, fontSize: 18, color: '#1f1f1f' }}>
          ⛽ Kiều Giá Xăng
        </Title>

        <div style={{ display: 'flex', gap: 16 }}>
          <Tooltip title="Đổi Webhook">
            <Button 
              type="text" 
              icon={<ApiOutlined />} 
              onClick={handleLogoutWebhook}
              style={{ fontWeight: 500 }}
            >
              Đổi Webhook
            </Button>
          </Tooltip>
          <Tooltip title="Làm mới cuộc trò chuyện">
            <Button type="primary" onClick={handleClearChat} style={{ color: '#fff' }}>
              Làm mới
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Chat Window */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          status={status}
          assistantName="Kiều ⛽"
          onDiscordSend={handleSendDiscord}
          onFuelRequest={handleFuelRequest}
        />
      </div>

      {/* Chat Input */}
      <div style={{ flexShrink: 0 }}>
        <ChatInput
          input={input}
          setInput={setInput}
          onSend={handleSend}
          isLoading={isLoading}
          assistantName="Kiều ⛽"
        />
      </div>
    </div>
  );
}
