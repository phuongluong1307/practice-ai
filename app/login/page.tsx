'use client';

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, message, Layout } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;
const { Content } = Layout;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Nếu đã đăng nhập thì chuyển hướng về home
    const user = localStorage.getItem('isLoggedIn');
    if (user === 'true') {
      router.push('/');
    }
  }, [router]);

  const onFinish = (values: any) => {
    setLoading(true);
    const { username, password } = values;

    // Giả lập delay cho chuyên nghiệp
    setTimeout(() => {
      if (username === 'admin' && password === 'admin') {
        localStorage.setItem('isLoggedIn', 'true');
        message.success('Đăng nhập thành công! Chào đại ca.');
        router.push('/');
      } else {
        message.error('Sai tài khoản hoặc mật khẩu rồi đại ca ơi!');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <Layout style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <Card 
          style={{ width: '100%', maxWidth: 400, borderRadius: 16, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
          bodyStyle={{ padding: '40px 30px' }}
        >
          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <div style={{ 
              width: 64, 
              height: 64, 
              background: '#f0f2f5', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: 32
            }}>
              🔑
            </div>
            <Title level={2} style={{ marginBottom: 8 }}>Chào Đại Ca!</Title>
            <Text type="secondary">Vui lòng đăng nhập để tiếp tục học tập</Text>
          </div>

          <Form
            name="login_form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Nhập username đi đại ca!' }]}
            >
              <Input 
                prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} 
                placeholder="Username (admin)" 
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Quên mật khẩu rồi kìa đại ca!' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="Password (admin)"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item style={{ marginTop: 24 }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading} 
                block 
                style={{ 
                  height: 45, 
                  borderRadius: 8, 
                  fontSize: 16, 
                  fontWeight: 600,
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
              >
                Đăng nhập ngay
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Content>
    </Layout>
  );
}
