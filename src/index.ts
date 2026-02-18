import 'dotenv/config';
import express from 'express';

import { createPet, listPets, getPet, updatePet, deletePet } from './controllers/pets.js';
import { createHabit, listHabits } from './controllers/habits.js';
import { createLog } from './controllers/logs.js';

const app = express();
app.use(express.json());

// routes - pets
app.post('/pets', createPet);
app.get('/pets', listPets);
app.get('/pets/:petId', getPet);
app.put('/pets/:petId', updatePet);
app.delete('/pets/:petId', deletePet);

// routes - habits
app.post('/pets/:petId/habits', createHabit);
app.get('/pets/:petId/habits', listHabits);

// routes - logs
app.post('/pets/:petId/logs', createLog);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
