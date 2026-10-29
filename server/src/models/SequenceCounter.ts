import mongoose, { Schema } from 'mongoose';

const sequenceCounterSchema = new Schema({
  _id: { type: String, required: true },
  sequence: { type: Number, required: true, default: 0 },
});

export const SequenceCounterModel = mongoose.models.SequenceCounter || mongoose.model('SequenceCounter', sequenceCounterSchema);