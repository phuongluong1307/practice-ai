'use client';

import { Layout, Spin } from 'antd';
import Sidebar from '@/app/components/Sidebar';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const { Sider, Content } = Layout;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
      router.push('/login');
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 16
      }}>
        <Spin size="large" />
        <p>Đang kiểm tra quyền truy cập của đại ca...</p>
      </div>
    );
  }

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      <Sider width={260} theme="light" breakpoint="lg" collapsedWidth="0">
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18 }}>📚 Bài tập dev AI</h2>
        </div>
        <Sidebar />
      </Sider>
      <Content style={{ display: 'flex', flexDirection: 'column' }}>
        {children}
      </Content>
    </Layout>
  );
}
