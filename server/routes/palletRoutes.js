// routes/palletRoutes.js

import express from 'express';

import {
  checkPalletExists,
  scanPallet,
  addBulkPallets,
  scanBulkPallet,
  getTruckPallets,
  loadPallet,
  markBulkArrived,
  startLoading,
  getTruckDeliveries,
} from '../controllers/palletController.js';

const router = express.Router();

/* =========================
   CHECK DUPLICATE PALLET
========================= */
router.post(
  '/check',
  checkPalletExists
);

/* =========================
   SCAN FLOOR PALLET
========================= */
router.post(
  '/scan',
  scanPallet
);

/* =========================
   ADD BULK EXPECTATION
========================= */
router.post(
  '/bulk',
  addBulkPallets
);

/* =========================
   SCAN BULK PALLET
========================= */
router.post(
  '/bulk-scan',
  scanBulkPallet
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