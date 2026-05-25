import mongoose from 'mongoose';

const floorSlotSchema =
  new mongoose.Schema(
    {
      /* =========================
         GRID POSITION
      ========================= */

      bay: {
        type: String,
        required: true,
        default: 'MAIN',
      },

      row: {
        type: Number,
        required: true,
      },

      column: {
        type: Number,
        required: true,
      },

      slotCode: {
        type: String,
        required: true,
        unique: true,
      },

      /* =========================
         SLOT STATUS
      ========================= */

      status: {
        type: String,
        enum: [
          'EMPTY',
          'PICKING',
          'FLOOR_READY',
          'WAITING_BULK',
          'ASSIGNED',
          'LOADING',
          'LOADED',
        ],
        default: 'EMPTY',
      },

      /* =========================
         PALLET LINK
      ========================= */

      palletId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: 'Pallet',
      },

      palletCode: {
        type: String,
      },

      last4Digits: {
        type: String,
      },

      /* =========================
         DELIVERY INFO
      ========================= */

      deliveryNumber: {
        type: String,
        index: true,
      },

      customerName: {
        type: String,
      },

      /* =========================
         BULK PLACEHOLDER
      ========================= */

      isBulkPlaceholder: {
        type: Boolean,
        default: false,
      },

      bulkQuantity: {
        type: Number,
        default: 0,
      },

      bulkType: {
        type: String,
        enum: [
          'SINGLE',
          'WITH_PICKING',
        ],
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
         PICKER INFO
      ========================= */

      pickerName: {
        type: String,
      },

      /* =========================
         TIMESTAMPS
      ========================= */

      placedAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      timestamps: true,
    }
  );

/* =========================
   AUTO SLOT CODE
========================= */

floorSlotSchema.pre(
  'validate',
  function (next) {
    if (
      this.row &&
      this.column
    ) {
      this.slotCode = `${this.bay}-${this.row}-${this.column}`;
    }

    next();
  }
);

export default mongoose.model(
  'FloorSlot',
  floorSlotSchema
);