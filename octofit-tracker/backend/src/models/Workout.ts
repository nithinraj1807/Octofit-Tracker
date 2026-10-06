import { model, Schema } from 'mongoose';

const workoutSchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
  durationMinutes: { type: Number, required: true, min: 1 },
  activityTypes: [{ type: String, enum: ['running', 'walking', 'strength', 'cycling'] }],
}, { timestamps: true });

export default model('Workout', workoutSchema);