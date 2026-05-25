import PickingSession from '../models/PickingSession.js';

/* =========================
   START PICKING SESSION
========================= */

export const startPickingSession =
  async (req, res) => {
    try {
      const {
        pickerName,
        deliveryNumber,
        customerName,
      } = req.body;

      if (
        !pickerName ||
        !deliveryNumber ||
        !customerName
      ) {
        return res.status(400).json({
          message:
            'Missing required fields',
        });
      }

      /* =========================
         CHECK EXISTING ACTIVE
      ========================= */

      const existing =
        await PickingSession.findOne({
          deliveryNumber,
          status: 'PICKING',
        });

      if (existing) {
        return res.status(400).json({
          message:
            'Picking session already active',
        });
      }

      /* =========================
         CREATE SESSION
      ========================= */

      const session =
        await PickingSession.create({
          pickerName,
          deliveryNumber,
          customerName,
          status: 'PICKING',
        });

      res.status(201).json(
        session
      );
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message:
          'Failed to start picking session',
      });
    }
  };

/* =========================
   COMPLETE SESSION
========================= */

export const completePickingSession =
  async (req, res) => {
    try {
      const session =
        await PickingSession.findById(
          req.params.id
        );

      if (!session) {
        return res.status(404).json({
          message:
            'Picking session not found',
        });
      }

      session.status =
        'COMPLETED';

      session.completedAt =
        new Date();

      await session.save();

      res.json(session);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message:
          'Failed to complete session',
      });
    }
  };

/* =========================
   GET ACTIVE SESSIONS
========================= */

export const getActivePickingSessions =
  async (req, res) => {
    try {
      const sessions =
        await PickingSession.find({
          status: 'PICKING',
        }).sort({
          createdAt: -1,
        });

      res.json(sessions);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message:
          'Failed to fetch sessions',
      });
    }
  };