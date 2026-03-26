'use client';

import { Menu } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';

const menuItems = [
  {
    key: '/bai-tap-1',
    icon: <MessageOutlined />,
    label: 'Bài 1',
  },
  // Thêm các bài tập khác ở đây sau này
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Menu
      mode="inline"
      selectedKeys={[pathname]}
      items={menuItems}
      onClick={({ key }) => router.push(key)}
      style={{ height: '100%', borderRight: 0 }}
    />
  );
}
