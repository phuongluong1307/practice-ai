import { streamText, tool, stepCountIs } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const SYSTEM_PROMPT = `Bạn là "Kiều" – một cô trợ lý thị trường xăng dầu cực kỳ hài hước, hay nhây và thích drama nhưng thông tin luôn chuẩn xác.

## Nhiệm vụ chính
- Tra cứu và báo cáo giá xăng dầu, bao gồm SO SÁNH giá cũ và giá mới nhất:
  1. Giá xăng trong nước (Việt Nam - từ PVOIL)
  2. Giá xăng quốc tế (giá dầu thô thế giới: Brent, WTI)
- Trình bày dưới dạng bảng markdown so sánh để dễ theo dõi biến động
- Gửi báo cáo lên Discord khi user yêu cầu

## Phong cách giao tiếp
- Tiếng Việt 100%
- Hay than thở về giá xăng kiểu "trời ơi đất hỡi", "ví tiền héo hon"
- Gọi user là "bạn ơi", "fen ơi", "anh/chị ơi"
- Thêm emoji xăng dầu, tiền bạc vào cho sinh động
- Khi báo giá: phải kêu than hoặc cà khịa vài câu mới chịu

## Quy trình
1. Khi user hỏi về giá xăng → dùng tool get_fuel_prices để lấy dữ liệu
2. Tìm kiếm cả giá hiện tại và giá kỳ điều hành trước đó trong dữ liệu trả về (nếu có)
3. Trình bày theo định dạng bảng so sánh dưới đây
4. Khi user yêu cầu gửi Discord → dùng tool send_discord_report

## Định dạng bắt buộc khi báo giá

📅 Cập nhật: [timestamp từ tool]

## ⛽ Giá Xăng Trong Nước (Việt Nam)

| Loại xăng | Giá mới (VNĐ) | Giá cũ (VNĐ) | Chênh lệch | Ghi chú |
|-----------|:-------------:|:------------:|:-----------:|---------|
| RON 95-III | [giá] | [giá cũ] | [+/-] | [ghi chú] |
| E5 RON 92 | [giá] | [giá cũ] | [+/-] | [ghi chú] |
| Dầu Diesel | [giá] | [giá cũ] | [+/-] | [ghi chú] |

## 🌍 Giá Dầu Quốc Tế (USD/thùng)

| Loại dầu | Giá mới (USD) | Giá cũ (USD) | Chênh lệch | Thị trường |
|----------|:-------------:|:------------:|:-----------:|-----------|
| Brent Crude | [giá] | [giá cũ] | [+/-] | London/ICE |
| WTI Crude | [giá] | [giá cũ] | [+/-] | New York/NYMEX |

## 📊 Tổng Hợp So Sánh Biến Động

| Chỉ số | Hiện tại | Trước đó | Biến động | Đơn vị |
|--------|:-------:|:--------:|:---------:|--------|
| Brent Crude | [giá] | [giá cũ] | [+/-] | USD |
| WTI Crude | [giá] | [giá cũ] | [+/-] | USD |
| RON 95-III | [giá] | [giá cũ] | [+/-] | VNĐ |

[vài câu bình luận hài hước/than thở về việc giá tăng hay giảm]

LƯU Ý: 
- Nếu không tìm thấy giá cũ trong dữ liệu, hãy ghi "N/A" hoặc "-".
- Giá quốc tế BẮT BUỘC để đơn vị là USD/thùng.
- Khi user yêu cầu gửi Discord → gọi tool send_discord_report với nội dung bảng đầy đủ.`;

function extractBestChunk(html: string, keywords: string[], chunkSize = 1500): string {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s{2,}/g, ' ')
    .trim();

  let bestStart = -1;
  let bestCount = 0;

  for (let i = 0; i < text.length; i += 200) {
    const chunk = text.slice(i, i + chunkSize);
    const count = keywords.filter((kw) => chunk.toLowerCase().includes(kw.toLowerCase())).length;
    if (count > bestCount) {
      bestCount = count;
      bestStart = i;
    }
  }

  if (bestStart >= 0 && bestCount >= 2) {
    return text.slice(bestStart, bestStart + chunkSize);
  }
  return text.slice(0, 2000);
}

async function scrapeDomesticPrices(): Promise<string> {
  const res = await fetch('https://www.pvoil.com.vn/tin-gia-xang-dau', {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) throw new Error(`PVOIL trả về status ${res.status}`);

  const html = await res.text();
  return extractBestChunk(html, ['RON', 'E5', 'Diesel', 'dầu', 'xăng', 'đồng/lít', 'VNĐ', 'đ/lít', 'giá']);
}

async function scrapeInternationalPrices(): Promise<string> {
  const res = await fetch('https://oilprice.com/oil-price-charts/', {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) throw new Error(`oilprice.com trả về status ${res.status}`);

  const html = await res.text();
  return extractBestChunk(html, ['Brent', 'WTI', 'crude', 'barrel', 'USD', 'price', 'oil'], 1500);
}

function getTimestamp(): string {
  return new Date().toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { messages, webhookUrl: clientWebhook } = body;

  const modelMessages = messages.map((msg: any) => {
    let text = msg.content;
    if (!text && msg.parts) {
      text = msg.parts
        .filter((p: any) => p.type === 'text')
        .map((p: any) => p.text)
        .join('');
    }
    return { role: msg.role, content: text || '' };
  });

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: SYSTEM_PROMPT,
    messages: modelMessages.slice(-20),
    stopWhen: stepCountIs(5),
    tools: {
      get_fuel_prices: tool({
        description:
          'Lấy giá xăng dầu mới nhất gồm: giá trong nước (PVOIL) và giá quốc tế (Brent, WTI). Dùng tool này khi user hỏi về giá xăng dầu.',
        inputSchema: z.object({}),
        execute: async () => {
          const [domesticResult, internationalResult] = await Promise.allSettled([
            scrapeDomesticPrices(),
            scrapeInternationalPrices(),
          ]);

          return {
            timestamp: getTimestamp(),
            domestic: {
              success: domesticResult.status === 'fulfilled',
              source: 'https://www.pvoil.com.vn/tin-gia-xang-dau',
              data: domesticResult.status === 'fulfilled' ? domesticResult.value : null,
              error: domesticResult.status === 'rejected' ? domesticResult.reason?.message : null,
            },
            international: {
              success: internationalResult.status === 'fulfilled',
              source: 'https://oilprice.com/oil-price-charts/',
              data: internationalResult.status === 'fulfilled' ? internationalResult.value : null,
              error: internationalResult.status === 'rejected' ? internationalResult.reason?.message : null,
            },
            note: 'Trình bày đúng định dạng bảng markdown với 3 bảng: Giá trong nước, Giá quốc tế, Tổng hợp so sánh. Dùng timestamp ở trên làm thời gian cập nhật.',
          };
        },
      }),

      send_discord_report: tool({
        description:
          'Gửi bảng tổng hợp giá xăng vào kênh Discord. Dùng khi user yêu cầu gửi báo cáo. Nội dung phải bao gồm bảng giá đầy đủ theo phong cách nhây của Kiều.',
        inputSchema: z.object({
          content: z
            .string()
            .describe(
              'Nội dung tin nhắn sẽ gửi lên Discord, viết theo phong cách hài hước của Kiều, bao gồm giá xăng đầy đủ dạng bảng.'
            ),
        }),
        execute: async ({ content }: { content: string }) => {
          // CHỈ lấy từ client (truyền lên từ localStorage của trình duyệt)
          const webhookUrl = clientWebhook;

          if (!webhookUrl || webhookUrl.includes('YOUR_WEBHOOK')) {
            return {
              success: false,
              error: 'Không tìm thấy Discord Webhook URL. Đại ca hãy nhập lại Webhook ở giao diện chat nhé!',
            };
          }

          try {
            const res = await fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ content }),
              signal: AbortSignal.timeout(8000),
            });

            if (!res.ok) {
              const errorText = await res.text();
              return {
                success: false,
                error: `Discord từ chối: status ${res.status}. ${errorText}`,
              };
            }

            return { success: true };
          } catch (err: any) {
            return {
              success: false,
              error: err.message || 'Không gửi được lên Discord.',
            };
          }
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
