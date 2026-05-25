import mongoose from 'mongoose';

const pickingSessionSchema =
  new mongoose.Schema(
    {
      /* =========================
         PICKER
      ========================= */

      pickerName: {
        type: String,
        required: true,
      },

      /* =========================
         DELIVERY
      ========================= */

      deliveryNumber: {
        type: String,
        required: true,
        index: true,
      },

      customerName: {
        type: String,
        required: true,
      },

      /* =========================
         STATUS
      ========================= */

      status: {
        type: String,
        enum: [
          'PICKING',
          'COMPLETED',
          'ISSUE',
        ],
        default: 'PICKING',
      },

      /* =========================
         PALLET COUNTS
      ========================= */

      palletCount: {
        type: Number,
        default: 0,
      },

      /* =========================
         ISSUES
      ========================= */

      hasIssue: {
        type: Boolean,
        default: false,
      },

      issueMessage: {
        type: String,
        default: '',
      },

      /* =========================
         TIMESTAMPS
      ========================= */

      startedAt: {
        type: Date,
        default: Date.now,
      },

      completedAt: {
        type: Date,
      },
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model(
  'PickingSession',
  pickingSessionSchema
);