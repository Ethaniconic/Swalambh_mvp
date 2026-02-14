import mongoose from 'mongoose';

const passwordResetSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: 'password_resets',
  }
);

// Create indexes
passwordResetSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 }); // Expire after 24 hours

export const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);
