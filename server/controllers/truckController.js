// controllers/truckController.js

import Truck from '../models/Truck.js';

/* =========================
   GET ALL TRUCKS
========================= */
export const getTrucks = async (
  req,
  res
) => {
  try {
    const {
      shiftDate,
      history,
    } = req.query;

    let query = {};

    /* =========================
       DATE FILTER
    ========================= */
    if (shiftDate) {
      query.shiftDate =
        shiftDate;
    }

    /* =========================
       HISTORY FILTER
    ========================= */
    if (history === 'true') {
      query.status = {
        $in: [
          'COMPLETE',
          'DISPATCHED',
        ],
      };
    } else {
      query.status = {
        $nin: [
          'DISPATCHED',
        ],
      };
    }

    const trucks =
      await Truck.find(
        query
      ).sort({
        shiftDate: -1,
        createdAt: -1,
      });

    res.json(trucks);
  } catch (error) {
    console.log(error);

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
      shiftDate,
      shiftType,
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

    /* USE PROVIDED DATE OR TODAY */
    const finalShiftDate =
      shiftDate ||
      new Date()
        .toISOString()
        .split('T')[0];

    /* =========================
       ACTIVE TRUCK CHECK
       SAME TRUCK
       SAME DATE
    ========================= */
    const activeTruck =
      await Truck.findOne({
        truckNumber,
        shiftDate:
          finalShiftDate,
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

    /* BLOCK DUPLICATE */
    if (activeTruck) {
      return res.status(400).json({
        message: `Truck ${truckNumber} already active for ${finalShiftDate}`,
      });
    }

    /* CREATE */
    const truck =
      await Truck.create({
        truckNumber,
        routeName,
        shiftDate:
          finalShiftDate,
        shiftType:
          shiftType ||
          'DAY',
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

      /* =========================
         DISPATCHED
      ========================= */
      if (
        req.body.status ===
        'DISPATCHED'
      ) {
        truck.dispatchedAt =
          new Date();

        truck.isArchived =
          true;
      }

      /* =========================
         COMPLETE
      ========================= */
      if (
        req.body.status ===
        'COMPLETE'
      ) {
        truck.completedAt =
          new Date();
      }

      await truck.save();

      const io =
        req.app.get('io');

      io.emit(
        'truck:updated',
        truck
      );

      res.json(truck);
    } catch (error) {
      console.log(error);

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
      console.log(error);

      res.status(500).json({
        message:
          'Failed to fetch truck',
      });
    }
  };