'use client';

import { useState } from 'react';
import { Avatar, Typography, Button, Tag, Space, Spin, Collapse } from 'antd';
import { UserOutlined, RobotOutlined, LoadingOutlined, CheckCircleOutlined, ToolOutlined, RightOutlined } from '@ant-design/icons';
import { useTypewriter } from '@/app/hooks/useTypewriter';
import type { UIToolInvocation } from 'ai';
import React from 'react';

const { Text } = Typography;

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  assistantName?: string;
  showDiscordButton?: boolean;
  onDiscordSend?: () => void;
  toolInvocations?: UIToolInvocation<any>[];
}

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

function renderTable(lines: string[], tableKey: number): React.ReactNode {
  const rows = lines.map((line) =>
    line
      .split('|')
      .filter((_, i, arr) => i > 0 && i < arr.length - 1)
      .map((c) => c.trim())
  );

  const sepIdx = rows.findIndex((row) => row.every((c) => /^[-: ]+$/.test(c)));
  if (sepIdx === -1 || rows.length < 2) return null;

  // Parse alignment from separator row
  const alignments = rows[sepIdx].map((c) => {
    if (c.startsWith(':') && c.endsWith(':')) return 'center' as const;
    if (c.endsWith(':')) return 'right' as const;
    return 'left' as const;
  });

  const headers = rows[0];
  const dataRows = rows.slice(sepIdx + 1).filter((r) => r.some((c) => c));

  return (
    <div key={tableKey} style={{ overflowX: 'auto', marginBottom: 8, marginTop: 4 }}>
      <table
        style={{
          borderCollapse: 'collapse',
          width: '100%',
          fontSize: 13,
          lineHeight: 1.5,
        }}
      >
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                style={{
                  border: '1px solid #d9d9d9',
                  padding: '6px 10px',
                  backgroundColor: '#f0eaff',
                  textAlign: alignments[i] ?? 'left',
                  whiteSpace: 'nowrap',
                  fontWeight: 600,
                }}
              >
                {renderInline(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataRows.map((row, ri) => (
            <tr key={ri} style={{ backgroundColor: ri % 2 === 0 ? '#fff' : '#fafafa' }}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  style={{
                    border: '1px solid #e8e8e8',
                    padding: '5px 10px',
                    textAlign: alignments[ci] ?? 'left',
                  }}
                >
                  {renderInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const result: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Markdown table block
    if (line.trim().startsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      const tableEl = renderTable(tableLines, result.length);
      if (tableEl) result.push(tableEl);
      continue;
    }

    // Heading ##
    if (line.startsWith('## ')) {
      result.push(
        <strong key={result.length} style={{ display: 'block', fontSize: 14, marginTop: 10, marginBottom: 2 }}>
          {renderInline(line.slice(3))}
        </strong>
      );
      i++;
      continue;
    }

    // Heading #
    if (line.startsWith('# ')) {
      result.push(
        <strong key={result.length} style={{ display: 'block', fontSize: 15, marginTop: 10, marginBottom: 2 }}>
          {renderInline(line.slice(2))}
        </strong>
      );
      i++;
      continue;
    }

    // Regular line
    result.push(
      <span key={result.length} style={{ display: 'block' }}>
        {line ? renderInline(line) : <br />}
      </span>
    );
    i++;
  }
  return result;
}

function ToolInvocationItem({ toolInvocation }: { toolInvocation: any }) {
  const [expanded, setExpanded] = useState(false);
  const toolName = toolInvocation.toolName || (toolInvocation.type?.startsWith('tool-') ? toolInvocation.type.slice(5) : 'tool');
  const { toolCallId, state } = toolInvocation;

  const isLoading = state === 'input-streaming' || state === 'input-available';
  const isDone = state === 'output-available';

  if (!isLoading && !isDone) return null;

  const hasInput = true;
  const hasOutput = isDone && toolInvocation.output !== undefined;
  const hasDetails = true;

  const formatJson = (data: any) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  const formatOutput = (output: any) => {
    if (output === null || output === undefined) return '{}';
    try {
      const result: Record<string, any> = {};
      if (typeof output === 'object') {
        result.success = output.success ?? (output.error ? false : true);
        if (output.message) result.message = output.message;
        if (output.error) result.message = output.error;
        if (!result.message) {
          result.message = result.success ? 'Thành công' : 'Thất bại';
        }
      } else {
        result.success = true;
        result.message = String(output);
      }
      return JSON.stringify(result, null, 2);
    } catch {
      return String(output);
    }
  };

  return (
    <div
      key={toolCallId}
      style={{
        marginBottom: 8,
        borderRadius: 8,
        border: '1px solid #e8e8e8',
        backgroundColor: '#fafafa',
        overflow: 'hidden',
      }}
    >
      {/* Header - collapsible */}
      <div
        onClick={() => hasDetails && setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          cursor: hasDetails ? 'pointer' : 'default',
          userSelect: 'none',
          backgroundColor: '#f5f5f5',
          borderBottom: expanded ? '1px solid #e8e8e8' : 'none',
        }}
      >
        {isLoading ? (
          <Spin indicator={<LoadingOutlined style={{ fontSize: 14, color: '#52c41a' }} spin />} />
        ) : (
          <CheckCircleOutlined style={{ fontSize: 14, color: '#52c41a' }} />
        )}
        <span style={{ flex: 1, fontSize: 13, fontFamily: 'monospace', color: '#333', fontWeight: 500 }}>
          {toolName}
        </span>
        {hasDetails && (
          <RightOutlined
            style={{
              fontSize: 10,
              color: '#999',
              transition: 'transform 0.2s',
              transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
            }}
          />
        )}
      </div>

      {/* Body - INPUT / OUTPUT */}
      {expanded && hasDetails && (
        <div style={{ padding: '10px 12px', fontSize: 13, fontFamily: 'monospace' }}>
          {hasInput && (
            <div style={{ marginBottom: hasOutput ? 12 : 0 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 11,
                  textTransform: 'uppercase',
                  color: '#d4380d',
                  marginBottom: 4,
                  borderLeft: '3px solid #d4380d',
                  paddingLeft: 8,
                }}
              >
                Input
              </div>
              <pre
                style={{
                  margin: 0,
                  padding: 8,
                  backgroundColor: '#fff',
                  borderRadius: 4,
                  fontSize: 12,
                  lineHeight: 1.5,
                  overflowX: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  color: '#333',
                }}
              >
                {formatJson(toolInvocation.input || {})}
              </pre>
            </div>
          )}

          {hasOutput && (
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 11,
                  textTransform: 'uppercase',
                  color: '#389e0d',
                  marginBottom: 4,
                  borderLeft: '3px solid #389e0d',
                  paddingLeft: 8,
                }}
              >
                Output
              </div>
              <pre
                style={{
                  margin: 0,
                  padding: 8,
                  backgroundColor: '#fff',
                  borderRadius: 4,
                  fontSize: 12,
                  lineHeight: 1.5,
                  overflowX: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  color: '#333',
                }}
              >
                {formatOutput(toolInvocation.output)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ChatMessage({ 
  role, 
  content, 
  isStreaming, 
  assistantName = 'Cô Minh 📚', 
  showDiscordButton, 
  onDiscordSend,
  toolInvocations 
}: ChatMessageProps) {
  const isUser = role === 'user';

  const displayText = useTypewriter(
    content,
    !isUser && (isStreaming !== undefined ? isStreaming : true),
    2,
    30
  );

  const isStillTyping = !isUser && displayText.length < content.length;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 20,
        gap: 10,
        alignItems: 'flex-start',
      }}
    >
      {/* Avatar bên trái cho assistant */}
      {!isUser && (
        <Avatar
          icon={<RobotOutlined />}
          size={38}
          style={{
            backgroundColor: '#722ed1',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(114, 46, 209, 0.3)',
          }}
        />
      )}

      {/* Nội dung tin nhắn */}
      <div style={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Tên role */}
        <Text
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: isUser ? '#1677ff' : '#722ed1',
            textAlign: isUser ? 'right' : 'left',
            paddingLeft: isUser ? 0 : 4,
            paddingRight: isUser ? 4 : 0,
          }}
        >
          {isUser ? 'Bạn' : assistantName}
        </Text>

        {/* Tool invocations - hiển thị NGOÀI bubble, dạng standalone panels */}
        {!isUser && toolInvocations && toolInvocations.length > 0 && (
          <div style={{ marginBottom: 4 }}>
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              {toolInvocations.map((ti: any, idx: number) => (
                <ToolInvocationItem key={ti.toolCallId || idx} toolInvocation={ti} />
              ))}
            </Space>
          </div>
        )}

        {/* Bóng chat - chỉ hiển thị nếu có nội dung text */}
        {(isUser || content) && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: isUser
              ? '16px 16px 4px 16px'
              : '16px 16px 16px 4px',
            background: isUser
              ? 'linear-gradient(135deg, #1677ff 0%, #4096ff 100%)'
              : '#ffffff',
            color: isUser ? '#fff' : '#2c2c2c',
            wordBreak: 'break-word',
            lineHeight: 1.7,
            boxShadow: isUser
              ? '0 2px 12px rgba(22, 119, 255, 0.25)'
              : '0 1px 8px rgba(0, 0, 0, 0.08)',
            border: isUser ? 'none' : '1px solid #f0f0f0',
          }}
        >

          {isUser ? (
            <Text style={{ color: '#fff', whiteSpace: 'pre-wrap' }}>{content}</Text>
          ) : (
            <div style={{ color: '#2c2c2c' }}>
              {renderMarkdown(displayText)}
              {(isStreaming || isStillTyping) && (
                <>
                  <span
                    className="streaming-cursor"
                    style={{
                      display: 'inline-block',
                      width: 2,
                      height: '1em',
                      backgroundColor: '#722ed1',
                      marginLeft: 2,
                      verticalAlign: 'text-bottom',
                    }}
                  />
                  <style>{`
                    @keyframes blinkCursor {
                      0%, 100% { opacity: 1; }
                      50% { opacity: 0; }
                    }
                    .streaming-cursor {
                      animation: blinkCursor 0.8s step-end infinite;
                    }
                    .discord-btn {
                      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                      box-shadow: 0 4px 12px rgba(88, 101, 242, 0.25);
                    }
                    .discord-btn:hover {
                      background-color: #4752C4 !important;
                      transform: translateY(-1px);
                      box-shadow: 0 6px 16px rgba(88, 101, 242, 0.35);
                    }
                    .discord-btn:active {
                      transform: translateY(0);
                    }
                  `}</style>
                </>
              )}
              {showDiscordButton && !isStreaming && !isStillTyping && (
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #f0f0f0' }}>
                  <Button
                    type="primary"
                    size="middle"
                    onClick={onDiscordSend}
                    className="discord-btn"
                    style={{
                      backgroundColor: '#5865F2',
                      borderColor: '#5865F2',
                      borderRadius: 8,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <span style={{ fontSize: 16 }}>📨</span>
                    <span>Gửi báo cáo lên Discord</span>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
        )}
      </div>

      {/* Avatar bên phải cho user */}
      {isUser && (
        <Avatar
          icon={<UserOutlined />}
          size={38}
          style={{
            backgroundColor: '#1677ff',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(22, 119, 255, 0.3)',
          }}
        />
      )}
    </div>
  );
}
