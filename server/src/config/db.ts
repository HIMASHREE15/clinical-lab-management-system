import mongoose from 'mongoose';
import { PatientModel } from '../models/Patient';
import { UserModel } from '../models/User';
import { SEED_PATIENTS, SEED_USERS } from '../utils/seedData';

export let isMongoConnected = false;

export const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/clinical_lab_db';
  try {
    mongoose.set('strictQuery', false);
    // Timeout quickly if MongoDB is not installed locally
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 2500,
    });
    await UserModel.bulkWrite(
      SEED_USERS.map((user) => ({
        updateOne: {
          filter: { email: user.email },
          update: { $set: user },
          upsert: true,
        },
      }))
    );
    await PatientModel.bulkWrite(
      SEED_PATIENTS.map((patient) => {
        const linkedUser = SEED_USERS.find((user) => user.email.toLowerCase() === patient.email?.toLowerCase());
        return {
          updateOne: {
            filter: { patientId: patient.patientId },
            update: {
              $setOnInsert: {
                ...patient,
                ...(linkedUser ? { userId: linkedUser._id } : {}),
              },
            },
            upsert: true,
          },
        };
      })
    );
    await Promise.all(
      SEED_PATIENTS.map(async (patient) => {
        const linkedUser = SEED_USERS.find((user) => user.email.toLowerCase() === patient.email?.toLowerCase());
        if (linkedUser) {
          await UserModel.updateOne({ _id: linkedUser._id }, { $set: { patientId: patient.patientId } }).exec();
        }
      })
    );
    isMongoConnected = true;
    console.log('✅ Connected to MongoDB database successfully.');
  } catch (error) {
    isMongoConnected = false;
    console.log('⚠️ Local MongoDB connection unavailable. Operating in high-performance mock/in-memory database mode with rich pre-loaded seed data.');
  }
};
