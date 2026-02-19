import 'dotenv/config';
import express from 'express';

import { createHabit, listHabits } from './controllers/habits.js';
import { createLog } from './controllers/logs.js';
import { createPet, deletePet, getPet, listPets, updatePet } from './controllers/pets.js';

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

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Tender listening on http://localhost:${PORT}`);
});
