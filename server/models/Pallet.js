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
        enum: ['FLOOR', 'BULK'],
        default: 'FLOOR',
      },

      status: {
        type: String,
        enum: [
          'SCANNED',
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

      loadedAt: {
        type: Date,
      },
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model(
  'Pallet',
  palletSchema
);