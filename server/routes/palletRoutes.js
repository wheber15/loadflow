// routes/palletRoutes.js

import express from 'express';

import {
  scanPallet,
  getTruckPallets,
  loadPallet,
  addBulkPallets,
  markBulkArrived,
  startLoading,
  getTruckDeliveries,
} from '../controllers/palletController.js';

const router = express.Router();

/* =========================
   SCAN FLOOR PALLET
========================= */
router.post(
  '/scan',
  scanPallet
);

/* =========================
   LOAD PALLET
========================= */
router.post(
  '/load',
  loadPallet
);

/* =========================
   START LOADING
========================= */
router.post(
  '/start-loading',
  startLoading
);

/* =========================
   ADD BULK PALLETS
========================= */
router.post(
  '/bulk',
  addBulkPallets
);

/* =========================
   BULK ARRIVED
========================= */
router.post(
  '/bulk-arrived',
  markBulkArrived
);

/* =========================
   GET TRUCK PALLETS
========================= */
router.get(
  '/truck/:truckId',
  getTruckPallets
);

/* =========================
   GET TRUCK DELIVERIES
========================= */
router.get(
  '/deliveries/:truckId',
  getTruckDeliveries
);

export default router;