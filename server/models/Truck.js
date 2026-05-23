import mongoose from 'mongoose';

const truckSchema = new mongoose.Schema(
  {
    truckNumber: {
      type: String,
      required: true,
      unique: true,
    },

    routeName: {
      type: String,
      required: true,
    },

    maxPallets: {
      type: Number,
      default: 26,
    },

    status: {
      type: String,
      enum: [
        'BUILDING',
        'FLOOR READY',
        'LOADING',
        'COMPLETE',
        'DISPATCHED',
      ],
      default: 'BUILDING',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Truck', truckSchema);