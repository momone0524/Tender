import { Request, Response } from 'express';
import { pets, petIdCounter } from '../models/pets.js';
import { CreatePetSchema, UpdatePetSchema } from '../validators/pets.js';
import { Pet } from '../entities/Pet.js';
import { differenceInMilliseconds } from 'date-fns';
import { NEGLECT_THRESHOLD_MS } from '../utils/config.js';

// ステージ計算関数
export function computeStage(pet: Pet): { stage: string; stageEmoji: string } {
  const now = new Date();
  if (differenceInMilliseconds(now, pet.lastFedAt) > NEGLECT_THRESHOLD_MS) {
    return { stage: 'cooked', stageEmoji: '🍗' };
  }

  const totalLogs = pet.totalLogs ?? 0; // totalLogs は optional で追加できる
  if (totalLogs === 0) return { stage: 'egg', stageEmoji: '🥚' };
  if (totalLogs <= 4) return { stage: 'hatching', stageEmoji: '🐣' };
  if (totalLogs <= 14) return { stage: 'growing', stageEmoji: '🐥' };
  return { stage: 'grown', stageEmoji: '🐓' };
}

// --------------------
// POST /pets
// --------------------
export const createPet = (req: Request, res: Response): void => {
  const parseResult = CreatePetSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json(parseResult.error);
  }

  const { name, species } = parseResult.data;

  const newPet: Pet & { totalLogs?: number } = {
    id: petIdCounter.value++,
    name,
    species,
    happiness: 50,
    hunger: 50,
    energy: 50,
    lastFedAt: new Date(),
    totalLogs: 0, // 初期ログ数
  };

  pets.push(newPet);

  const stageInfo = computeStage(newPet);

  res.status(201).json({
    ...newPet,
    stage: stageInfo.stage,
    stageEmoji: stageInfo.stageEmoji,
  });
};

// --------------------
// GET /pets
// --------------------
export const listPets = (req: Request, res: Response): void => {
  let result = pets;

  // クエリフィルター
  const { species, minHappiness } = req.query;

  if (species) {
    result = result.filter((p) => p.species === String(species));
  }

  if (minHappiness) {
    const minH = Number(minHappiness);
    if (!isNaN(minH)) {
      result = result.filter((p) => p.happiness >= minH);
    }
  }

  // ステージ情報を追加
  const petsWithStage = result.map((p) => {
    const stageInfo = computeStage(p);
    return { ...p, stage: stageInfo.stage, stageEmoji: stageInfo.stageEmoji };
  });

  res.json(petsWithStage);
};

// --------------------
// GET /pets/:id
// --------------------
export const getPet = (req: Request, res: Response): void | Response => {
  const petId = Number(req.params.petId);
  const pet = pets.find((p) => p.id === petId);
  if (!pet) return res.status(404).json({ message: 'Pet not found' });

  const stageInfo = computeStage(pet);
  return res.json({ ...pet, stage: stageInfo.stage, stageEmoji: stageInfo.stageEmoji });
};

// --------------------
// PUT /pets/:id
// --------------------
export const updatePet = (req: Request, res: Response): void | Response => {
  const petId = Number(req.params.petId);
  const pet = pets.find((p) => p.id === petId);
  if (!pet) return res.status(404).json({ message: 'Pet not found' });

  const parseResult = UpdatePetSchema.safeParse(req.body);
  if (!parseResult.success) return res.status(400).json(parseResult.error);

  pet.name = parseResult.data.name;

  const stageInfo = computeStage(pet);
  res.json({ ...pet, stage: stageInfo.stage, stageEmoji: stageInfo.stageEmoji });
};

// --------------------
// DELETE /pets/:id
// --------------------
export const deletePet = (req: Request, res: Response): void | Response => {
  const petId = Number(req.params.petId);
  const index = pets.findIndex((p) => p.id === petId);
  if (index === -1) return res.status(404).json({ message: 'Pet not found' });

  pets.splice(index, 1);
  res.status(204).send();
};
