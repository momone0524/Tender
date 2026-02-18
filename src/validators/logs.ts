import { z } from 'zod';

export const CreateLogSchema = z.object({
  habitId: z.number().int(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format' }),
  note: z.string().max(200).optional(),
});
export type CreateLogInput = z.infer<typeof CreateLogSchema>;
