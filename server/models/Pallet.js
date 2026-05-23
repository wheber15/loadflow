// models/Pallet.js

import mongoose from 'mongoose';

const palletSchema =
  new mongoose.Schema(
    {
      palletCode: {
        type: String,
        required: true,
        unique: true,
        index: true,
      },

      last4Digits: {
        type: String,
      },

      deliveryNumber: {
        type: String,
        required: true,
        index: true,
      },

      customerName: {
        type: String,
        required: true,
      },

      deliveryId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: 'Delivery',
      },

      truckId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: 'Truck',
      },

      palletType: {
        type: String,
        enum: [
          'FLOOR',
          'BULK',
        ],
        default: 'FLOOR',
      },

      status: {
        type: String,
        enum: [
          'SCANNED',
          'BULK',
          'READY',
          'LOADING',
          'LOADED',
        ],
        default: 'SCANNED',
      },

      scannedAt: {
        type: Date,
        default: Date.now,
      },

      bulkArrivedAt: {
        type: Date,
      },

      loadingStartedAt: {
        type: Date,
      },

      loadedAt: {
        type: Date,
      },
    },
    {
      timestamps: true,
    }
  );

/* =========================
   AUTO LAST 4 DIGITS
========================= */
palletSchema.pre(
  'save',
  function (next) {
    if (
      this.palletCode &&
      !this.last4Digits
    ) {
      this.last4Digits =
        this.palletCode.slice(-4);
    }

    next();
  }
);

export default mongoose.model(
  'Pallet',
  palletSchema
);