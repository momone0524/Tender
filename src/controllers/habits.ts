import { Request, Response } from 'express';
import { pets } from '../models/pets.js';
import { habits, habitIdCounter } from '../models/habits.js';
import { CreateHabitSchema, HabitQuerySchema } from '../validators/habits.js';
import { computeStage } from './pets.js'; // 既存の関数を使える

// --------------------
// POST /pets/:petId/habits
// --------------------
export const createHabit = (req: Request, res: Response): void | Response => {
  const petId = Number(req.params.petId);
  const pet = pets.find((p) => p.id === petId);

  if (!pet) return res.status(404).json({ message: 'Pet not found' });

  // pet が cooked かチェック
  const stageInfo = computeStage(pet);
  if (stageInfo.stage === 'cooked') {
    return res.status(400).json({ message: 'This pet has been cooked. Adopt a new one.' });
  }

  // バリデーション
  const parseResult = CreateHabitSchema.safeParse(req.body);
  if (!parseResult.success) return res.status(400).json(parseResult.error);

  const { name, category, targetFrequency, statBoost } = parseResult.data;

  const newHabit = {
    id: habitIdCounter.value++,
    petId,
    name,
    category,
    targetFrequency,
    statBoost,
  };

  habits.push(newHabit);

  res.status(201).json(newHabit);
};

// --------------------
// GET /pets/:petId/habits
// --------------------
export const listHabits = (req: Request, res: Response): void | Response => {
  const petId = Number(req.params.petId);
  const pet = pets.find((p) => p.id === petId);

  if (!pet) return res.status(404).json({ message: 'Pet not found' });

  // query パラメータ optional
  const parseResult = HabitQuerySchema.safeParse(req.query);
  let categoryFilter: string | undefined = undefined;
  if (parseResult.success) {
    categoryFilter = parseResult.data.category;
  }

  let result = habits.filter((h) => h.petId === petId);
  if (categoryFilter) {
    result = result.filter((h) => h.category === categoryFilter);
  }

  res.json(result);
};
