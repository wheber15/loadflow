import express from 'express';

import {
  createTruck,
  getTrucks,
  updateTruckStatus,
} from '../controllers/truckController.js';

const router = express.Router();

router.get('/', getTrucks);

router.post('/', createTruck);

/* UPDATE STATUS */
router.patch(
  '/:id/status',
  updateTruckStatus
);

export default router;