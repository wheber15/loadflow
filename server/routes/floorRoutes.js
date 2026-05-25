import express from 'express';

import {
  getFloorGrid,
  createFloorGrid,
  placePalletInSlot,
  clearFloorSlot,
} from '../controllers/floorController.js';

const router = express.Router();

/* =========================
   GET FLOOR GRID
========================= */
router.get(
  '/',
  getFloorGrid
);

/* =========================
   CREATE FLOOR GRID
========================= */
router.post(
  '/create',
  createFloorGrid
);

/* =========================
   PLACE PALLET
========================= */
router.post(
  '/place',
  placePalletInSlot
);

/* =========================
   CLEAR SLOT
========================= */
router.delete(
  '/:id',
  clearFloorSlot
);

export default router;