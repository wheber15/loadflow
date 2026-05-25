import mongoose from 'mongoose';

const userSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
      },

      pin: {
        type: String,
        required: true,
      },

      role: {
        type: String,
        enum: [
          'PICKER',
          'SUPERVISOR',
          'ADMIN',
          'MANAGER',
        ],
        default: 'PICKER',
      },

      isActiveSession: {
        type: Boolean,
        default: false,
      },

      currentSessionId: {
        type: String,
        default: '',
      },

      lastLoginAt: {
        type: Date,
      },
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model(
  'User',
  userSchema
);