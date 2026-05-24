// controllers/palletController.js

import Pallet from '../models/Pallet.js';
import Truck from '../models/Truck.js';
import Delivery from '../models/Delivery.js';

/* =========================
   SAFE BARCODE VALIDATION
========================= */
const validateBarcode = (
  palletCode
) => {
  if (!palletCode) {
    return false;
  }

  /* REMOVE SPACES */
  const cleaned =
    palletCode
      .toString()
      .replace(/\s/g, '');

  /* SAP LABELS SHOULD BE NUMERIC */
  if (!/^\d+$/.test(cleaned)) {
    return false;
  }

  /* EXPECTED LENGTH */
  if (cleaned.length < 16) {
    return false;
  }

  return cleaned;
};

/* =========================
   SAFE LAST 4
========================= */
const getLast4Digits = (
  palletCode
) => {
  const cleaned =
    palletCode
      .toString()
      .replace(/\s/g, '');

  return cleaned.substring(
    cleaned.length - 4
  );
};

/* =========================
   UPDATE TRUCK STATUS
========================= */
const updateTruckStatus =
  async (truckId) => {
    const truck =
      await Truck.findById(
        truckId
      );

    if (!truck) return;

    const deliveries =
      await Delivery.find({
        truckId,
      });

    const totalFloor =
      deliveries.reduce(
        (sum, d) =>
          sum + d.floorPallets,
        0
      );

    /* ONLY MISSING BULK */
    const totalBulkWaiting =
      deliveries.reduce(
        (sum, d) =>
          sum +
          Math.max(
            d.bulkPallets -
              d.scannedBulkPallets,
            0
          ),
        0
      );

    const totalLoaded =
      deliveries.reduce(
        (sum, d) =>
          sum + d.loadedPallets,
        0
      );

    truck.floorReadyCount =
      totalFloor;

    truck.bulkWaitingCount =
      totalBulkWaiting;

    truck.loadedCount =
      totalLoaded;

    truck.deliveryCount =
      deliveries.length;

    const totalActive =
      totalFloor +
      totalBulkWaiting;

    if (totalActive === 0) {
      truck.status = 'EMPTY';
    } else if (
      totalBulkWaiting > 0
    ) {
      truck.status =
        'WAITING_BULK';
    } else if (
      totalFloor >=
      truck.maxPallets
    ) {
      truck.status =
        'FLOOR_READY';
    }

    if (
      totalLoaded >=
      truck.maxPallets
    ) {
      truck.status =
        'COMPLETE';
    }

    await truck.save();

    return truck;
  };

/* =========================
   CHECK DUPLICATE PALLET
========================= */
export const checkPalletExists =
  async (req, res) => {
    try {
      let { palletCode } =
        req.body;

      palletCode =
        validateBarcode(
          palletCode
        );

      if (!palletCode) {
        return res.status(400).json({
          message:
            'Invalid barcode',
        });
      }

      const existing =
        await Pallet.findOne({
          palletCode,
        }).populate('truckId');

      if (existing) {
        return res.status(400).json({
          message:
            `Pallet already assigned to Truck ${existing.truckId?.truckNumber || '?'}`,
          truckNumber:
            existing.truckId
              ?.truckNumber,
          routeName:
            existing.truckId
              ?.routeName,
          shiftDate:
            existing.truckId
              ?.shiftDate,
        });
      }

      res.json({
        success: true,
      });
    } catch (error) {
      res.status(500).json({
        message:
          'Failed to check pallet',
      });
    }
  };

/* =========================
   SCAN FLOOR PALLET
========================= */
export const scanPallet =
  async (req, res) => {
    try {
      let {
        palletCode,
        truckId,
        deliveryNumber,
        customerName,
      } = req.body;

      palletCode =
        validateBarcode(
          palletCode
        );

      if (!palletCode) {
        return res.status(400).json({
          message:
            'Invalid barcode scan. Please rescan pallet.',
        });
      }

      /* DELIVERY NUMBER VALIDATION */
      if (
        !/^\d{10}$/.test(
          deliveryNumber
        )
      ) {
        return res.status(400).json({
          message:
            'Delivery number must be exactly 10 digits',
        });
      }

      if (
        !truckId ||
        !deliveryNumber ||
        !customerName
      ) {
        return res.status(400).json({
          message:
            'Missing required fields',
        });
      }

      const existingPallet =
        await Pallet.findOne({
          palletCode,
        }).populate('truckId');

      if (existingPallet) {
        return res.status(400).json({
          message:
            `Pallet already assigned to Truck ${existingPallet.truckId?.truckNumber || '?'}`,
          truckNumber:
            existingPallet.truckId
              ?.truckNumber,
          routeName:
            existingPallet.truckId
              ?.routeName,
          shiftDate:
            existingPallet.truckId
              ?.shiftDate,
        });
      }

      const truck =
        await Truck.findById(
          truckId
        );

      if (!truck) {
        return res.status(404).json({
          message:
            'Truck not found',
        });
      }

      if (
        [
          'LOADING',
          'COMPLETE',
          'DISPATCHED',
        ].includes(
          truck.status
        )
      ) {
        return res.status(400).json({
          message:
            'Truck locked for scanning',
        });
      }

      const totalPallets =
        await Pallet.countDocuments(
          {
            truckId,
          }
        );

      if (
        totalPallets >=
        truck.maxPallets
      ) {
        return res.status(400).json({
          message:
            'Truck already full',
        });
      }

      const last4Digits =
        getLast4Digits(
          palletCode
        );

      let delivery =
        await Delivery.findOne({
          truckId,
          deliveryNumber,
        });

      if (!delivery) {
        delivery =
          await Delivery.create({
            deliveryNumber,
            customerName,
            truckId,
            totalPallets: 0,
            floorPallets: 0,
            bulkPallets: 0,
            scannedBulkPallets: 0,
            loadedPallets: 0,
            status: 'BUILDING',
          });
      }

      const pallet =
        await Pallet.create({
          palletCode,
          last4Digits,
          deliveryNumber,
          customerName,
          deliveryId:
            delivery._id,
          truckId,
          palletType: 'FLOOR',
          status: 'READY',
        });

      delivery.totalPallets += 1;
      delivery.floorPallets += 1;

      if (
        delivery.bulkPallets === 0
      ) {
        delivery.status =
          'FLOOR_READY';
      }

      await delivery.save();

      const updatedTruck =
        await updateTruckStatus(
          truckId
        );

      const io =
        req.app.get('io');

      io.emit(
        'pallet:scanned',
        pallet
      );

      io.emit(
        'delivery:updated',
        delivery
      );

      io.emit(
        'truck:updated',
        updatedTruck
      );

      res.status(201).json({
        pallet,
        delivery,
        message:
          'Pallet scanned successfully',
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message:
          error.message,
      });
    }
  };

/* =========================
   ADD BULK EXPECTATION
========================= */
export const addBulkPallets =
  async (req, res) => {
    try {
      const {
        deliveryId,
        quantity,
      } = req.body;

      const delivery =
        await Delivery.findById(
          deliveryId
        );

      if (!delivery) {
        return res.status(404).json({
          message:
            'Delivery not found',
        });
      }

      delivery.bulkPallets =
        Number(quantity);

      delivery.status =
        'WAITING_BULK';

      await delivery.save();

      const updatedTruck =
        await updateTruckStatus(
          delivery.truckId
        );

      const io =
        req.app.get('io');

      io.emit(
        'delivery:updated',
        delivery
      );

      io.emit(
        'truck:updated',
        updatedTruck
      );

      res.json({
        message:
          'Bulk quantity added',
        delivery,
      });
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };

/* =========================
   SCAN BULK PALLET
========================= */
export const scanBulkPallet =
  async (req, res) => {
    try {
      let {
        palletCode,
        truckId,
        deliveryNumber,
      } = req.body;

      palletCode =
        validateBarcode(
          palletCode
        );

      if (!palletCode) {
        return res.status(400).json({
          message:
            'Invalid barcode scan',
        });
      }

      const existingPallet =
        await Pallet.findOne({
          palletCode,
        }).populate('truckId');

      if (existingPallet) {
        return res.status(400).json({
          message:
            `Pallet already assigned to Truck ${existingPallet.truckId?.truckNumber || '?'}`,
          truckNumber:
            existingPallet.truckId
              ?.truckNumber,
          routeName:
            existingPallet.truckId
              ?.routeName,
          shiftDate:
            existingPallet.truckId
              ?.shiftDate,
        });
      }

      const delivery =
        await Delivery.findOne({
          truckId,
          deliveryNumber,
        });

      if (!delivery) {
        return res.status(404).json({
          message:
            'Delivery not found',
        });
      }

      if (
        delivery.scannedBulkPallets >=
        delivery.bulkPallets
      ) {
        return res.status(400).json({
          message:
            'All bulk pallets already scanned',
        });
      }

      const last4Digits =
        getLast4Digits(
          palletCode
        );

      const pallet =
        await Pallet.create({
          palletCode,
          last4Digits,
          deliveryNumber,
          customerName:
            delivery.customerName,
          deliveryId:
            delivery._id,
          truckId,
          palletType: 'BULK',
          status: 'BULK',
        });

      delivery.scannedBulkPallets += 1;
      delivery.totalPallets += 1;

      await delivery.save();

      const updatedTruck =
        await updateTruckStatus(
          truckId
        );

      const io =
        req.app.get('io');

      io.emit(
        'pallet:scanned',
        pallet
      );

      io.emit(
        'delivery:updated',
        delivery
      );

      io.emit(
        'truck:updated',
        updatedTruck
      );

      res.status(201).json({
        pallet,
        delivery,
        message:
          'Bulk pallet scanned successfully',
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message:
          error.message,
      });
    }
  };

/* =========================
   MARK BULK ARRIVED
========================= */
export const markBulkArrived =
  async (req, res) => {
    try {
      const { deliveryId } =
        req.body;

      const delivery =
        await Delivery.findById(
          deliveryId
        );

      if (!delivery) {
        return res.status(404).json({
          message:
            'Delivery not found',
        });
      }

      if (
        delivery.scannedBulkPallets <
        delivery.bulkPallets
      ) {
        return res.status(400).json({
          message:
            'Still waiting for bulk pallets',
        });
      }

      await Pallet.updateMany(
        {
          deliveryId,
          palletType: 'BULK',
          status: 'BULK',
        },
        {
          status: 'READY',
        }
      );

      /* FIXED DOUBLE COUNT ISSUE */
      delivery.floorPallets =
        await Pallet.countDocuments({
          deliveryId,
          status: 'READY',
        });

      delivery.status =
        'FLOOR_READY';

      await delivery.save();

      const updatedTruck =
        await updateTruckStatus(
          delivery.truckId
        );

      const io =
        req.app.get('io');

      io.emit(
        'delivery:updated',
        delivery
      );

      io.emit(
        'truck:updated',
        updatedTruck
      );

      res.json({
        message:
          'Bulk pallets moved to floor',
        delivery,
      });
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };

/* =========================
   START LOADING
========================= */
export const startLoading =
  async (req, res) => {
    try {
      const { truckId } =
        req.body;

      const truck =
        await Truck.findById(
          truckId
        );

      if (!truck) {
        return res.status(404).json({
          message:
            'Truck not found',
        });
      }

      if (
        truck.floorReadyCount <
        truck.maxPallets
      ) {
        return res.status(400).json({
          message:
            'Truck not fully ready',
        });
      }

      if (
        truck.bulkWaitingCount >
        0
      ) {
        return res.status(400).json({
          message:
            'Bulk pallets still waiting',
        });
      }

      truck.status =
        'LOADING';

      await truck.save();

      const io =
        req.app.get('io');

      io.emit(
        'truck:updated',
        truck
      );

      res.json({
        message:
          'Loading started',
        truck,
      });
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };

/* =========================
   LOAD PALLET
========================= */
export const loadPallet =
  async (req, res) => {
    try {
      let { palletCode } =
        req.body;

      palletCode =
        validateBarcode(
          palletCode
        );

      if (!palletCode) {
        return res.status(400).json({
          message:
            'Invalid barcode',
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

      const truck =
        await Truck.findById(
          pallet.truckId
        );

      if (!truck) {
        return res.status(404).json({
          message:
            'Truck not found',
        });
      }

      if (
        truck.status !==
        'LOADING'
      ) {
        return res.status(400).json({
          message:
            'Truck not in loading mode',
        });
      }

      if (
        pallet.status ===
        'LOADED'
      ) {
        return res.status(400).json({
          message:
            'Pallet already loaded',
        });
      }

      pallet.status =
        'LOADED';

      pallet.loadedAt =
        new Date();

      await pallet.save();

      const delivery =
        await Delivery.findById(
          pallet.deliveryId
        );

      if (delivery) {
        delivery.loadedPallets += 1;

        if (
          delivery.loadedPallets >=
          delivery.totalPallets
        ) {
          delivery.status =
            'COMPLETE';
        }

        await delivery.save();
      }

      const updatedTruck =
        await updateTruckStatus(
          truck._id
        );

      const io =
        req.app.get('io');

      io.emit(
        'pallet:loaded',
        pallet
      );

      io.emit(
        'truck:updated',
        updatedTruck
      );

      res.json({
        message:
          'Pallet loaded successfully',
        pallet,
      });
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
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
        message:
          error.message,
      });
    }
  };

/* =========================
   GET TRUCK DELIVERIES
========================= */
export const getTruckDeliveries =
  async (req, res) => {
    try {
      const deliveries =
        await Delivery.find({
          truckId:
            req.params.truckId,
        }).sort({
          createdAt: -1,
        });

      res.json(deliveries);
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };