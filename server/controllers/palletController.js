import Pallet from '../models/Pallet.js';
import Truck from '../models/Truck.js';
import Delivery from '../models/Delivery.js';

/* =========================
   UPDATE TRUCK STATUS
========================= */
const updateTruckStatus = async (
  truckId
) => {
  const truck =
    await Truck.findById(truckId);

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

  const totalBulk =
    deliveries.reduce(
      (sum, d) =>
        sum + d.bulkPallets,
      0
    );

  const totalLoaded =
    deliveries.reduce(
      (sum, d) =>
        sum + d.loadedPallets,
      0
    );

  /* LIVE COUNTS */
  truck.floorReadyCount =
    totalFloor;

  truck.bulkWaitingCount =
    totalBulk;

  truck.loadedCount =
    totalLoaded;

  truck.deliveryCount =
    deliveries.length;

  const totalActive =
    totalFloor + totalBulk;

  /* EMPTY */
  if (totalActive === 0) {
    truck.status = 'EMPTY';
  }

  /* WAITING BULK */
  else if (totalBulk > 0) {
    truck.status =
      'WAITING_BULK';
  }

  /* FLOOR READY */
  else if (
    totalFloor >=
    truck.maxPallets
  ) {
    truck.status =
      'FLOOR_READY';
  }

  /* COMPLETE */
  if (
    totalLoaded >=
    truck.maxPallets
  ) {
    truck.status =
      'COMPLETE';
  }

  await truck.save();
};

/* =========================
   SCAN FLOOR PALLET
========================= */
export const scanPallet = async (
  req,
  res
) => {
  try {
    const {
      palletCode,
      truckId,
      deliveryNumber,
      customerName,
    } = req.body;

    /* VALIDATION */
    if (
      !palletCode ||
      !truckId ||
      !deliveryNumber ||
      !customerName
    ) {
      return res.status(400).json({
        message:
          'Missing required fields',
      });
    }

    /* DUPLICATE */
    const existingPallet =
      await Pallet.findOne({
        palletCode,
      });

    if (existingPallet) {
      return res.status(400).json({
        message:
          'Pallet already exists in system',
      });
    }

    /* TRUCK */
    const truck =
      await Truck.findById(
        truckId
      );

    if (!truck) {
      return res.status(404).json({
        message: 'Truck not found',
      });
    }

    /* BLOCK IF LOADING */
    if (
      truck.status ===
        'LOADING' ||
      truck.status ===
        'COMPLETE' ||
      truck.status ===
        'DISPATCHED'
    ) {
      return res.status(400).json({
        message:
          'Truck locked for scanning',
      });
    }

    /* TOTAL PALLETS */
    const totalPallets =
      await Pallet.countDocuments({
        truckId,
      });

    if (
      totalPallets >=
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

    /* FIND DELIVERY */
    let delivery =
      await Delivery.findOne({
        truckId,
        deliveryNumber,
      });

    /* CREATE DELIVERY */
    if (!delivery) {
      delivery =
        await Delivery.create({
          deliveryNumber,
          customerName,
          truckId,
          totalPallets: 0,
          floorPallets: 0,
          bulkPallets: 0,
          loadedPallets: 0,
          status: 'BUILDING',
        });
    }

    /* CREATE PALLET */
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

    /* UPDATE DELIVERY */
    delivery.totalPallets += 1;

    delivery.floorPallets += 1;

    /* DELIVERY READY */
    if (
      delivery.bulkPallets === 0
    ) {
      delivery.status =
        'FLOOR_READY';
    }

    await delivery.save();

    /* UPDATE TRUCK */
    await updateTruckStatus(
      truckId
    );

    /* SOCKET */
    const io = req.app.get('io');

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
      truck
    );

    /* RESPONSE */
    res.status(201).json({
      pallet,
      delivery,
      message:
        'Pallet scanned successfully',
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

/* =========================
   ADD BULK PALLETS
========================= */
export const addBulkPallets =
  async (req, res) => {
    try {
      const {
        truckId,
        deliveryNumber,
        quantity,
      } = req.body;

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

      delivery.bulkPallets +=
        Number(quantity);

      delivery.totalPallets +=
        Number(quantity);

      delivery.status =
        'WAITING_BULK';

      await delivery.save();

      await updateTruckStatus(
        truckId
      );

      const io =
        req.app.get('io');

      io.emit(
        'delivery:updated',
        delivery
      );

      res.json({
        message:
          'Bulk pallets added',
        delivery,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
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

      delivery.floorPallets +=
        delivery.bulkPallets;

      delivery.bulkPallets = 0;

      delivery.status =
        'FLOOR_READY';

      await delivery.save();

      await updateTruckStatus(
        delivery.truckId
      );

      const io =
        req.app.get('io');

      io.emit(
        'delivery:updated',
        delivery
      );

      res.json({
        message:
          'Bulk pallets moved to floor',
        delivery,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
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
          message: 'Truck not found',
        });
      }

      /* MUST BE READY */
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

      truck.status = 'LOADING';

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
        message: error.message,
      });
    }
  };

/* =========================
   LOAD PALLET
========================= */
export const loadPallet =
  async (req, res) => {
    try {
      const { palletCode } =
        req.body;

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

      /* MUST BE LOADING */
      if (
        truck.status !==
        'LOADING'
      ) {
        return res.status(400).json({
          message:
            'Truck not in loading mode',
        });
      }

      /* ALREADY LOADED */
      if (
        pallet.status ===
        'LOADED'
      ) {
        return res.status(400).json({
          message:
            'Pallet already loaded',
        });
      }

      pallet.status = 'LOADED';

      pallet.loadedAt =
        new Date();

      await pallet.save();

      /* DELIVERY */
      const delivery =
        await Delivery.findById(
          pallet.deliveryId
        );

      if (delivery) {
        delivery.loadedPallets += 1;

        /* COMPLETE DELIVERY */
        if (
          delivery.loadedPallets >=
          delivery.totalPallets
        ) {
          delivery.status =
            'COMPLETE';
        }

        await delivery.save();
      }

      /* AUTO COMPLETE TRUCK */
      const totalLoaded =
        await Pallet.countDocuments(
          {
            truckId:
              truck._id,
            status: 'LOADED',
          }
        );

      if (
        totalLoaded >=
        truck.maxPallets
      ) {
        truck.status =
          'COMPLETE';

        await truck.save();
      }

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
        truck
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
        message: error.message,
      });
    }
  };