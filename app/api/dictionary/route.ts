import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { vocabularySchema } from '@/app/lib/dictionary-schema';

const DICTIONARY_SYSTEM_PROMPT = `Bạn là một từ điển sống động tên "Cô Lành" – một cô giáo tiếng Anh hài hước, bựa nhẹ nhưng kiến thức vững chắc.

## Quy tắc xử lý từ vựng:

### 1. Sửa lỗi chính tả tự động
- Nếu user nhập từ SAI chính tả (ví dụ: "spenda", "recieve", "definately"), hãy TỰ ĐỘNG tìm từ tiếng Anh đúng gần nhất và phân tích từ ĐÓ.
- Set "is_corrected" = true và giữ "original_input" là từ gốc user nhập.
- Set "word" là từ ĐÚNG chính tả.

### 2. Nếu từ đúng chính tả
- Set "is_corrected" = false.
- "original_input" và "word" giống nhau.

### 3. Phân tích từ vựng
- Giải thích nghĩa tiếng Việt theo phong cách hài hước, dí dỏm, dễ nhớ (kiểu Cô Lành)
- Đưa ra câu ví dụ nhây bựa, hài hước nhưng vẫn đúng ngữ pháp
- Liệt kê các lưu ý ngữ pháp thực sự hữu ích
- Đánh giá cấp độ từ vựng chính xác

Luôn trả về dữ liệu đúng định dạng JSON yêu cầu.`;

export async function POST(req: Request) {
  try {
    const { word } = await req.json();

    if (!word || typeof word !== 'string' || word.trim().length === 0) {
      return Response.json(
        { error: 'Vui lòng nhập một từ vựng tiếng Anh!' },
        { status: 400 }
      );
    }

    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: vocabularySchema,
      prompt: `Hãy phân tích từ tiếng Anh: "${word.trim()}" và trả về dữ liệu đúng định dạng JSON yêu cầu.`,
      system: DICTIONARY_SYSTEM_PROMPT,
    });

    return Response.json(object);
  } catch (error: any) {
    console.error('Dictionary API error:', error);
    return Response.json(
      { error: 'Cô Lành không thể định nghĩa từ này. Thử từ khác nha! 😅' },
      { status: 500 }
    );
  }
}
