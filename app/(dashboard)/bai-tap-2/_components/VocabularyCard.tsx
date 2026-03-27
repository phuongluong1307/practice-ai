'use client';

import { useState, useCallback } from 'react';
import { Card, Descriptions, Tag, List, Typography, Alert, Tooltip } from 'antd';
import { SoundOutlined } from '@ant-design/icons';
import type { VocabularyResult } from '@/app/(dashboard)/bai-tap-2/_lib/dictionary-schema';

const { Title, Text } = Typography;

const levelColorMap: Record<string, string> = {
  'Dễ': 'green',
  'Trung bình': 'orange',
  'Khó': 'red',
};

interface VocabularyCardProps {
  data: VocabularyResult;
}

export default function VocabularyCard({ data }: VocabularyCardProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const playPronunciation = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    // Dừng nếu đang phát
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.85; // Tốc độ chậm hơn một chút để nghe rõ hơn
    utterance.pitch = 1;
    utterance.volume = 1;

    // Ưu tiên giọng tiếng Anh tự nhiên
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(
      (v) => v.lang.startsWith('en') && v.name.toLowerCase().includes('natural')
    ) || voices.find(
      (v) => v.lang.startsWith('en-US')
    ) || voices.find(
      (v) => v.lang.startsWith('en')
    );
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  return (
    <Card
      style={{
        maxWidth: 700,
        margin: '24px auto',
        borderRadius: 16,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        border: '1px solid #f0f0f0',
      }}
    >
      {data.is_corrected && data.original_input && (
        <Alert
          title={<span>Bạn có phải ý là: <b style={{ fontSize: 16 }}>{data.word}</b>? (Từ bạn nhập <i>&ldquo;{data.original_input}&rdquo;</i> chưa chính xác)</span>}
          type="warning"
          showIcon
          style={{ marginBottom: 20, borderRadius: 8 }}
        />
      )}
      {/* Header: Word + Phonetic + Level */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 20,
          flexWrap: 'wrap',
        }}
      >
        <Title level={2} style={{ margin: 0, color: '#1677ff' }}>
          {data.word}
        </Title>
        <Tooltip title="Nhấn để nghe phát âm">
          <span
            onClick={() => playPronunciation(data.word)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 16,
              color: isSpeaking ? '#1677ff' : '#8c8c8c',
              fontStyle: 'italic',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 8,
              transition: 'all 0.3s ease',
              backgroundColor: isSpeaking ? '#e6f4ff' : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (!isSpeaking) {
                e.currentTarget.style.color = '#1677ff';
                e.currentTarget.style.backgroundColor = '#e6f4ff';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSpeaking) {
                e.currentTarget.style.color = '#8c8c8c';
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <SoundOutlined
              style={{
                marginRight: 4,
                fontSize: 18,
                animation: isSpeaking ? 'pulse 1s infinite' : 'none',
              }}
            />
            {data.phonetic}
          </span>
        </Tooltip>
        <Tag
          color={levelColorMap[data.level] || 'default'}
          style={{
            fontSize: 13,
            padding: '2px 12px',
            borderRadius: 12,
            fontWeight: 600,
          }}
        >
          {data.level}
        </Tag>
        <Tag
          color="purple"
          style={{
            fontSize: 13,
            padding: '2px 12px',
            borderRadius: 12,
            fontWeight: 600,
            fontStyle: 'italic',
          }}
        >
          {data.part_of_speech}
        </Tag>
      </div>

      {/* Meaning & Example */}
      <Descriptions
        column={1}
        bordered
        size="middle"
        style={{ marginBottom: 20 }}
        styles={{
          label: {
            fontWeight: 600,
            width: 140,
            backgroundColor: '#fafafa',
          },
        }}
      >
        <Descriptions.Item label="📖 Nghĩa">
          <Text style={{ fontSize: 15 }}>{data.meaning}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="💬 Ví dụ">
          <Text italic style={{ fontSize: 15, color: '#595959' }}>
            &ldquo;{data.example}&rdquo;
          </Text>
        </Descriptions.Item>
      </Descriptions>

      {/* Grammar Notes */}
      {data.grammar_notes && data.grammar_notes.length > 0 && (
        <div>
          <Title level={5} style={{ marginBottom: 8 }}>
            📝 Lưu ý ngữ pháp
          </Title>
          <List
            size="small"
            dataSource={data.grammar_notes}
            renderItem={(note: string, index: number) => (
              <List.Item
                style={{
                  padding: '8px 12px',
                  backgroundColor: index % 2 === 0 ? '#f6ffed' : '#fff',
                  borderRadius: 8,
                  marginBottom: 4,
                }}
              >
                <Text>
                  <Tag color="blue" style={{ borderRadius: 8, marginRight: 8 }}>
                    {index + 1}
                  </Tag>
                  {note}
                </Text>
              </List.Item>
            )}
          />
        </div>
      )}
    </Card>
  );
}
