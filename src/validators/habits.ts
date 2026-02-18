import { z } from 'zod';

// --------------------
// POST /pets/:petId/habits
// --------------------
export const CreateHabitSchema = z.object({
  name: z.string().min(1).max(50),
  category: z.enum(['health', 'fitness', 'mindfulness', 'learning', 'social']),
  targetFrequency: z.number().int().min(1).max(7),
  statBoost: z.enum(['happiness', 'hunger', 'energy']),
});

// --------------------
// GET /pets/:petId/habits の query パラメータ用（optional filter）
// --------------------
export const HabitQuerySchema = z.object({
  category: z.enum(['health', 'fitness', 'mindfulness', 'learning', 'social']).optional(),
});

// --------------------
// TypeScript 用の型定義
// --------------------
export type CreateHabitInput = z.infer<typeof CreateHabitSchema>;
export type HabitQueryInput = z.infer<typeof HabitQuerySchema>;
