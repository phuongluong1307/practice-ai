'use client';

import { Layout } from 'antd';
import Sidebar from '@/app/components/Sidebar';

const { Sider, Content } = Layout;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
