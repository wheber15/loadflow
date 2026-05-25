import FloorSlot from '../models/FloorSlot.js';
import Pallet from '../models/Pallet.js';

/* =========================
   GET FLOOR GRID
========================= */
export const getFloorGrid =
  async (req, res) => {
    try {
      const slots =
        await FloorSlot.find()
          .populate('palletId')
          .populate('truckId')
          .sort({
            row: 1,
            column: 1,
          });

      res.json(slots);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message:
          'Failed to fetch floor grid',
      });
    }
  };

/* =========================
   CREATE FLOOR GRID
========================= */
export const createFloorGrid =
  async (req, res) => {
    try {
      const {
        rows = 10,
        columns = 8,
        bay = 'MAIN',
      } = req.body;

      const existing =
        await FloorSlot.countDocuments();

      if (existing > 0) {
        return res.status(400).json({
          message:
            'Floor grid already exists',
        });
      }

      const slots = [];

      for (
        let row = 1;
        row <= rows;
        row++
      ) {
        for (
          let column = 1;
          column <= columns;
          column++
        ) {
          slots.push({
            bay,
            row,
            column,
            status: 'EMPTY',
          });
        }
      }

      await FloorSlot.insertMany(
        slots
      );

      res.json({
        message:
          'Floor grid created successfully',
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message:
          'Failed to create floor grid',
      });
    }
  };

/* =========================
   PLACE PALLET
========================= */
export const placePalletInSlot =
  async (req, res) => {
    try {
      const {
        slotId,
        palletCode,
        pickerName,
      } = req.body;

      const slot =
        await FloorSlot.findById(
          slotId
        );

      if (!slot) {
        return res.status(404).json({
          message:
            'Floor slot not found',
        });
      }

      if (
        slot.status !== 'EMPTY'
      ) {
        return res.status(400).json({
          message:
            'Slot already occupied',
        });
      }

      const pallet =
        await Pallet.findOne({
          palletCode,
        });

      if (!pallet) {
        return res.status(404).json({
          message:
            'Pallet not found',
        });
      }

      slot.status = 'PICKING';

      slot.palletId =
        pallet._id;

      slot.palletCode =
        pallet.palletCode;

      slot.last4Digits =
        pallet.last4Digits;

      slot.deliveryNumber =
        pallet.deliveryNumber;

      slot.customerName =
        pallet.customerName;

      slot.pickerName =
        pickerName || '';

      slot.placedAt =
        new Date();

      await slot.save();

      res.json(slot);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message:
          'Failed to place pallet',
      });
    }
  };

/* =========================
   CLEAR SLOT
========================= */
export const clearFloorSlot =
  async (req, res) => {
    try {
      const slot =
        await FloorSlot.findById(
          req.params.id
        );

      if (!slot) {
        return res.status(404).json({
          message:
            'Slot not found',
        });
      }

      slot.status = 'EMPTY';

      slot.palletId = null;

      slot.palletCode = '';

      slot.last4Digits = '';

      slot.deliveryNumber =
        '';

      slot.customerName = '';

      slot.isBulkPlaceholder =
        false;

      slot.bulkQuantity = 0;

      slot.bulkType = null;

      slot.truckId = null;

      slot.pickerName = '';

      await slot.save();

      res.json({
        message:
          'Floor slot cleared',
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message:
          'Failed to clear slot',
      });
    }
  };