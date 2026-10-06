import express from 'express';
import type { Model } from 'mongoose';
import type { NextFunction, Request, Response } from 'express';
import Activity from './models/Activity.js';
import Leaderboard from './models/Leaderboard.js';
import Team from './models/Team.js';
import User from './models/User.js';
import Workout from './models/Workout.js';
import { connectDatabase } from './config/database.js';

const app = express();
const port = Number(process.env.PORT || 8000);
const codespaceName = process.env.CODESPACE_NAME;
export const baseUrl = codespaceName
  ? `https://${codespaceName}-8000.app.github.dev`
  : 'http://localhost:8000';

app.use(express.json());

app.get('/', (_request, response) => {
  response.json({ name: 'OctoFit Tracker API', baseUrl, health: '/api/health' });
});

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});

function listResource<T>(resourceModel: Model<T>, populatePaths: string[] = []) {
  return async (_request: Request, response: Response, next: NextFunction) => {
    try {
      const query = resourceModel.find();
      for (const path of populatePaths) query.populate(path);
      response.json(await query.exec());
    } catch (error) {
      next(error);
    }
  };
}

app.get('/api/users/', listResource(User, ['team']));
app.get('/api/teams/', listResource(Team, ['members']));
app.get('/api/activities/', listResource(Activity, ['user']));
app.get('/api/leaderboard/', listResource(Leaderboard, ['user', 'team']));
app.get('/api/workouts/', listResource(Workout));

app.use((error: Error, _request: Request, response: Response, _next: NextFunction) => {
  console.error('API request failed:', error);
  response.status(500).json({ error: 'Internal server error' });
});

void connectDatabase()
  .then(() => {
    app.listen(port, '0.0.0.0', () => {
      console.log(`OctoFit API listening at ${baseUrl}`);
    });
  })
  .catch((error: unknown) => {
    console.error('Unable to start OctoFit API:', error);
    process.exitCode = 1;
  });