import Pallet from '../models/Pallet.js';
import Truck from '../models/Truck.js';

/* =========================
   SCAN PALLET (BUILDING)
========================= */
export const scanPallet = async (
  req,
  res
) => {
  try {
    const { palletCode, truckId } =
      req.body;

    const existingPallet =
      await Pallet.findOne({
        palletCode,
      });

    /* DUPLICATE SCAN */
    if (existingPallet) {
      return res.status(400).json({
        message:
          'Duplicate pallet already scanned',
      });
    }

    const truck =
      await Truck.findById(
        truckId
      );

    if (!truck) {
      return res.status(404).json({
        message: 'Truck not found',
      });
    }

    /* MAX PALLETS */
    const palletCount =
      await Pallet.countDocuments({
        truckId,
      });

    if (
      palletCount >=
      truck.maxPallets
    ) {
      return res.status(400).json({
        message:
          'Truck already full',
      });
    }

    /* LAST 4 */
    const last4Digits =
      palletCode.slice(-4);

    /* CREATE PALLET */
    const pallet =
      await Pallet.create({
        palletCode,
        last4Digits,
        truckId,
        status: 'SCANNED',
      });

    const io = req.app.get('io');

    io.emit(
      'pallet:scanned',
      pallet
    );

    res.status(201).json(pallet);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/* =========================
   LOAD PALLET (LOADING)
========================= */
export const loadPallet = async (
  req,
  res
) => {
  try {
    const { palletCode, truckId } =
      req.body;

    const pallet =
      await Pallet.findOne({
        palletCode,
      });

    /* NOT FOUND */
    if (!pallet) {
      return res.status(404).json({
        message:
          'Pallet not found',
      });
    }

    /* WRONG TRUCK */
    if (
      pallet.truckId.toString() !==
      truckId
    ) {
      return res.status(400).json({
        message:
          'Wrong truck pallet',
      });
    }

    /* ALREADY LOADED */
    if (
      pallet.status === 'LOADED'
    ) {
      return res.status(400).json({
        message:
          'Pallet already loaded',
      });
    }

    /* UPDATE STATUS */
    pallet.status = 'LOADED';

    pallet.loadedAt = new Date();

    await pallet.save();

    const io = req.app.get('io');

    io.emit(
      'pallet:loaded',
      pallet
    );

    res.json({
      message:
        'Pallet loaded successfully',
      pallet,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/* =========================
   GET TRUCK PALLETS
========================= */
export const getTruckPallets =
  async (req, res) => {
    try {
      const pallets =
        await Pallet.find({
          truckId:
            req.params.truckId,
        }).sort({
          createdAt: -1,
        });

      res.json(pallets);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };