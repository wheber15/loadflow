import express from 'express';

import {
  scanPallet,
  getTruckPallets,
  loadPallet,
} from '../controllers/palletController.js';

const router = express.Router();

router.post('/scan', scanPallet);

router.post('/load', loadPallet);

router.get(
  '/truck/:truckId',
  getTruckPallets
);

export default router;