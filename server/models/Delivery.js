import mongoose from 'mongoose';

const deliverySchema = new mongoose.Schema(
  {
    deliveryNumber: {
      type: String,
      required: true,
    },

    customerName: {
      type: String,
      required: true,
    },

    truckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Truck',
      required: true,
    },

    totalPallets: {
      type: Number,
      default: 0,
    },

    floorPallets: {
      type: Number,
      default: 0,
    },

    bulkPallets: {
      type: Number,
      default: 0,
    },

    loadedPallets: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        'BUILDING',
        'WAITING_BULK',
        'FLOOR_READY',
        'LOADING',
        'COMPLETE',
      ],
      default: 'BUILDING',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  'Delivery',
  deliverySchema
);