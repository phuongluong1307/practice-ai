'use client';

import { useState } from 'react';
import { Input, Typography, Skeleton, message, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import VocabularyCard from '@/app/(dashboard)/bai-tap-2/_components/VocabularyCard';
import type { VocabularyResult } from '@/app/lib/dictionary-schema';

const { Title, Text } = Typography;
const { Search } = Input;

export default function BaiTap2Page() {
  const [result, setResult] = useState<VocabularyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      message.warning('Nhập từ vựng vào đi đại ca! 😄');
      return;
    }

    setLoading(true);
    setSearched(true);
    setResult(null);

    try {
      const res = await fetch('/api/dictionary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        message.error(data.error || 'Có lỗi xảy ra khi tra từ!');
        return;
      }

      setResult(data);
    } catch (error) {
      console.error('Fetch error:', error);
      message.error('Cô Lành đang bận, thử lại sau nha! 😅');
    } finally {
      setLoading(false);
    }
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
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Title level={4} style={{ margin: 0, fontSize: 18, color: '#1f1f1f' }}>
          📚 Từ Điển Cô Lành
        </Title>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '24px',
        }}
      >
        {/* Search Input */}
        <div style={{ maxWidth: 500, margin: '0 auto 24px' }}>
          <Text
            type="secondary"
            style={{
              display: 'block',
              marginBottom: 8,
              textAlign: 'center',
              fontSize: 14,
            }}
          >
            Nhập từ tiếng Anh để Cô Lành giải thích theo phong cách &ldquo;bựa nhưng chất&rdquo; 🤪
          </Text>
          <Search
            placeholder="Ví dụ: serendipity, procrastinate, ubiquitous..."
            enterButton={
              <>
                <SearchOutlined /> Tra từ
              </>
            }
            size="large"
            onSearch={handleSearch}
            loading={loading}
            allowClear
            style={{ width: '100%' }}
          />
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div
            style={{
              maxWidth: 700,
              margin: '0 auto',
              padding: 24,
              backgroundColor: '#fff',
              borderRadius: 16,
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            }}
          >
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
        )}

        {/* Result Card */}
        {!loading && result && <VocabularyCard data={result} />}

        {/* Empty State */}
        {!loading && !result && searched && (
          <Empty
            description="Cô Lành không tìm thấy từ này 😢"
            style={{ marginTop: 48 }}
          />
        )}

        {/* Initial State */}
        {!loading && !result && !searched && (
          <div style={{ textAlign: 'center', marginTop: 64 }}>
            <Text type="secondary" style={{ fontSize: 48 }}>
              📖
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: 16, marginTop: 16, display: 'block' }}>
              Nhập một từ tiếng Anh phía trên để bắt đầu!
            </Text>
          </div>
        )}
      </div>
    </div>
  );
}
