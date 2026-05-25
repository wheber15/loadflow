import mongoose from 'mongoose';

const userSchema =
  new mongoose.Schema(
    {
      /* =========================
         BASIC
      ========================= */

      name: {
        type: String,
        required: true,
        unique: true,
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

      /* =========================
         SESSION
      ========================= */

      isActiveSession: {
        type: Boolean,
        default: false,
      },

      currentSessionId: {
        type: String,
        default: '',
      },

      isOnline: {
        type: Boolean,
        default: false,
      },

      /* =========================
         ACTIVITY
      ========================= */

      currentPage: {
        type: String,
        default: '',
      },

      activeOrder: {
        type: String,
        default: '',
      },

      lastLoginAt: {
        type: Date,
      },

      lastLogoutAt: {
        type: Date,
      },

      lastActivityAt: {
        type: Date,
      },

      /* =========================
         DEVICE
      ========================= */

      deviceName: {
        type: String,
        default: '',
      },

      terminalName: {
        type: String,
        default: '',
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