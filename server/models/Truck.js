// models/Truck.js

import mongoose from 'mongoose';

const truckSchema =
  new mongoose.Schema(
    {
      /* INTERNAL LOAD ID */
      loadId: {
        type: String,
        unique: true,
      },

      /* VISIBLE TRUCK NUMBER */
      truckNumber: {
        type: Number,
        required: true,
      },

      routeName: {
        type: String,
        required: true,
      },

      /* =========================
         SHIFT / LOAD DATE
         USED FOR:
         - DAILY DASHBOARD
         - HISTORY
         - FUTURE LOADS
         - PRELOADS
      ========================= */
      shiftDate: {
        type: String,
        required: true,
        default: () => {
          return new Date()
            .toISOString()
            .split('T')[0];
        },
      },

      /* =========================
         OPTIONAL SHIFT TYPE
      ========================= */
      shiftType: {
        type: String,
        enum: [
          'DAY',
          'NIGHT',
          'PRELOAD',
        ],
        default: 'DAY',
      },

      /* =========================
         LOAD STATE
      ========================= */
      isArchived: {
        type: Boolean,
        default: false,
      },

      maxPallets: {
        type: Number,
        default: 26,
      },

      deliveryCount: {
        type: Number,
        default: 0,
      },

      floorReadyCount: {
        type: Number,
        default: 0,
      },

      bulkWaitingCount: {
        type: Number,
        default: 0,
      },

      loadedCount: {
        type: Number,
        default: 0,
      },

      /* =========================
         DRIVER / DISPATCH
      ========================= */
      driverName: {
        type: String,
        default: '',
      },

      trailerNumber: {
        type: String,
        default: '',
      },

      dockNumber: {
        type: String,
        default: '',
      },

      /* =========================
         STATUS
      ========================= */
      status: {
        type: String,
        enum: [
          'EMPTY',
          'BUILDING',
          'WAITING_BULK',
          'FLOOR_READY',
          'LOADING',
          'COMPLETE',
          'DISPATCHED',
        ],
        default: 'BUILDING',
      },

      dispatchedAt: {
        type: Date,
      },

      completedAt: {
        type: Date,
      },
    },
    {
      timestamps: true,
    }
  );

/* =========================
   GENERATE LOAD ID
========================= */
truckSchema.pre(
  'save',
  async function (next) {
    if (!this.loadId) {
      const date = new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, '');

      const random =
        Math.floor(
          1000 +
            Math.random() * 9000
        );

      this.loadId = `LF-${date}-${random}`;
    }

    next();
  }
);

export default mongoose.model(
  'Truck',
  truckSchema
);