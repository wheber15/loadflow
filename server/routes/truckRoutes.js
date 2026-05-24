// routes/truckRoutes.js

import express from 'express';

import {
  createTruck,
  getTrucks,
  updateTruckStatus,
  getTruckById,
} from '../controllers/truckController.js';

const router = express.Router();

/* =========================
   GET ALL TRUCKS
   SUPPORTS:
   ?shiftDate=
   ?history=
========================= */
router.get(
  '/',
  getTrucks
);

/* =========================
   GET SINGLE TRUCK
========================= */
router.get(
  '/:id',
  getTruckById
);

/* =========================
   CREATE TRUCK
========================= */
router.post(
  '/',
  createTruck
);

/* =========================
   UPDATE STATUS
========================= */
router.patch(
  '/:id/status',
  updateTruckStatus
);

export default router;