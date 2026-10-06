import { model, Schema } from 'mongoose';

const activitySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  activityType: { type: String, enum: ['running', 'walking', 'strength', 'cycling'], required: true },
  title: { type: String, required: true, trim: true },
  durationMinutes: { type: Number, required: true, min: 1 },
  distanceKm: { type: Number, min: 0, default: 0 },
  caloriesBurned: { type: Number, min: 0, default: 0 },
  pointsEarned: { type: Number, min: 0, default: 0 },
  completedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default model('Activity', activitySchema);