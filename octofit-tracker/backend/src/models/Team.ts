import { model, Schema } from 'mongoose';

const teamSchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  points: { type: Number, min: 0, default: 0 },
}, { timestamps: true });

export default model('Team', teamSchema);