'use client';

import { Menu } from 'antd';
import { BookOutlined, MessageOutlined, ThunderboltOutlined, LogoutOutlined } from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';
import { message } from 'antd';

const menuItems = [
  {
    key: '/bai-tap-1',
    icon: <MessageOutlined />,
    label: 'Cô Minh English',
  },
  {
    key: '/bai-tap-2',
    icon: <BookOutlined />,
    label: 'Từ điển Cô Lành',
  },
  {
    key: '/bai-tap-3',
    icon: <ThunderboltOutlined />,
    label: 'Kiều Giá Xăng',
  },
  {
    key: 'logout',
    icon: <LogoutOutlined />,
    label: 'Đăng xuất',
    danger: true,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      localStorage.removeItem('isLoggedIn');
      message.success('Đã đăng xuất thành công!');
      router.push('/login');
      return;
    }
    router.push(key);
  };

  return (
    <Menu
      mode="inline"
      selectedKeys={[pathname]}
      items={menuItems}
      onClick={handleMenuClick}
      style={{ height: '100%', borderRight: 0 }}
    />
  );
}
