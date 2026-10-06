import { model, Schema } from 'mongoose';

const userSchema = new Schema({
  username: { type: String, required: true, unique: true, trim: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  team: { type: Schema.Types.ObjectId, ref: 'Team', default: null },
  points: { type: Number, min: 0, default: 0 },
}, { timestamps: true });

export default model('User', userSchema);