import mongoose from 'mongoose';

const bulkOrderSchema =
  new mongoose.Schema(
    {
      /* =========================
         DELIVERY INFO
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
         BULK INFO
      ========================= */

      bulkQuantity: {
        type: Number,
        required: true,
        default: 1,
      },

      bulkType: {
        type: String,
        enum: [
          'SINGLE',
          'WITH_PICKING',
        ],
        required: true,
      },

      /* =========================
         WORKFLOW STATUS
      ========================= */

      status: {
        type: String,
        enum: [
          'WAITING',
          'ACTIVE',
          'READY',
          'ASSIGNED',
          'COMPLETE',
        ],
        default: 'WAITING',
      },

      /* =========================
         FLOOR ACTIVATION
      ========================= */

      activatedAt: {
        type: Date,
      },

      readyAt: {
        type: Date,
      },

      /* =========================
         TRUCK ASSIGNMENT
      ========================= */

      truckId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: 'Truck',
      },

      /* =========================
         NOTES
      ========================= */

      notes: {
        type: String,
      },

      /* =========================
         OFFICE USER
      ========================= */

      createdBy: {
        type: String,
      },
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model(
  'BulkOrder',
  bulkOrderSchema
);