import { z } from 'zod';

export const vocabularySchema = z.object({
  word: z.string().describe('Từ tiếng Anh đúng chính tả (đã sửa nếu user nhập sai)'),
  original_input: z.string().describe('Từ gốc mà user đã nhập'),
  is_corrected: z.boolean().describe('true nếu từ user nhập bị sai chính tả và đã được sửa, false nếu đúng'),
  phonetic: z.string().describe('Phiên âm IPA, ví dụ: /ˌserənˈdɪpɪti/'),
  meaning: z.string().describe('Nghĩa tiếng Việt - giải thích hài hước, dí dỏm kiểu Cô Lành'),
  example: z.string().describe('Câu ví dụ bằng tiếng Anh - nhây bựa, hài hước'),
  grammar_notes: z.array(z.string()).describe('Danh sách các lưu ý ngữ pháp liên quan đến từ này'),
  level: z.enum(['Dễ', 'Trung bình', 'Khó']).describe('Cấp độ từ vựng'),
});

export type VocabularyResult = z.infer<typeof vocabularySchema>;
