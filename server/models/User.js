import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    full_name: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      default: null,
    },
    hashed_password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

export const User = mongoose.model('User', userSchema);
