import mongoose from 'mongoose';

const palletSchema =
  new mongoose.Schema(
    {
      palletCode: {
        type: String,
        required: true,
        unique: true,
      },

      last4Digits: {
        type: String,
      },

      truckId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: 'Truck',
      },

      status: {
        type: String,
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