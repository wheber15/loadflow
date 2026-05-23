import Truck from '../models/Truck.js';

/* =========================
   GET ALL TRUCKS
========================= */
export const getTrucks = async (
  req,
  res
) => {
  try {
    const trucks =
      await Truck.find().sort({
        createdAt: -1,
      });

    res.json(trucks);
  } catch (error) {
    res.status(500).json({
      message:
        'Failed to fetch trucks',
    });
  }
};

/* =========================
   CREATE TRUCK
========================= */
export const createTruck = async (
  req,
  res
) => {
  try {
    const {
      truckNumber,
      routeName,
    } = req.body;

    /* VALIDATION */
    if (
      !truckNumber ||
      !routeName
    ) {
      return res.status(400).json({
        message:
          'Truck number and route required',
      });
    }

    /* ACTIVE TRUCK CHECK */
    const activeTruck =
      await Truck.findOne({
        truckNumber,
        status: {
          $in: [
            'BUILDING',
            'WAITING_BULK',
            'FLOOR_READY',
            'LOADING',
            'COMPLETE',
          ],
        },
      });

    /* BLOCK DUPLICATE ACTIVE TRUCK */
    if (activeTruck) {
      return res.status(400).json({
        message: `Truck ${truckNumber} already active`,
      });
    }

    /* CREATE */
    const truck =
      await Truck.create({
        truckNumber,
        routeName,
        maxPallets: 26,
        status: 'BUILDING',
      });

    res.status(201).json(truck);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message:
        'Failed to create truck',
    });
  }
};

/* =========================
   UPDATE STATUS
========================= */
export const updateTruckStatus =
  async (req, res) => {
    try {
      const truck =
        await Truck.findById(
          req.params.id
        );

      if (!truck) {
        return res.status(404).json({
          message:
            'Truck not found',
        });
      }

      truck.status =
        req.body.status;

      /* DISPATCH TIME */
      if (
        req.body.status ===
        'DISPATCHED'
      ) {
        truck.dispatchedAt =
          new Date();
      }

      await truck.save();

      res.json(truck);
    } catch (error) {
      res.status(500).json({
        message:
          'Failed to update status',
      });
    }
  };

/* =========================
   GET SINGLE TRUCK
========================= */
export const getTruckById =
  async (req, res) => {
    try {
      const truck =
        await Truck.findById(
          req.params.id
        );

      if (!truck) {
        return res.status(404).json({
          message:
            'Truck not found',
        });
      }

      res.json(truck);
    } catch (error) {
      res.status(500).json({
        message:
          'Failed to fetch truck',
      });
    }
  };