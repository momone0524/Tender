// src/controllers/logs.ts
import { Request, Response } from 'express';
import { pets } from '../models/pets.js';
import { habits } from '../models/habits.js';
import { logs, logIdCounter } from '../models/logs.js';
import { CreateLogSchema } from '../validators/logs.js';
import { computeStage } from './pets.js'; // pets.ts から export しておく必要あり

// POST /pets/:petId/logs
export const createLog = (req: Request, res: Response): Response | void => {
  const petId = Number(req.params.petId);
  const pet = pets.find((p) => p.id === petId);
  if (!pet) return res.status(404).json({ message: 'Pet not found' });

  const stageInfo = computeStage(pet);
  if (stageInfo.stage === 'cooked') {
    return res.status(400).json({ message: 'This pet has been cooked. Adopt a new one.' });
  }

  // バリデーション
  const parseResult = CreateLogSchema.safeParse(req.body);
  if (!parseResult.success) return res.status(400).json(parseResult.error);

  const { habitId, date, note } = parseResult.data;

  // habit がその pet に属しているか確認
  const habit = habits.find((h) => h.id === habitId && h.petId === petId);
  if (!habit) return res.status(400).json({ message: 'Habit does not belong to this pet' });

  // pet の stat を +10（最大 100）
  const stat = habit.statBoost;
  if (stat === 'happiness') pet.happiness = Math.min(100, pet.happiness + 10);
  if (stat === 'hunger') pet.hunger = Math.min(100, pet.hunger + 10);
  if (stat === 'energy') pet.energy = Math.min(100, pet.energy + 10);

  // neglect timer を更新
  pet.lastFedAt = new Date();

  // 🔹 totalLogs を増やす
  pet.totalLogs = (pet.totalLogs ?? 0) + 1;

  // log を作成
  const newLog = {
    id: logIdCounter.value++,
    petId,
    habitId,
    date,
    note,
  };
  logs.push(newLog);

  return res.status(201).json(newLog);
};
