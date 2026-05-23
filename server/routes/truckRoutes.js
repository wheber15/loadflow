import express from 'express';

import {
  createTruck,
  getTrucks,
  updateTruckStatus,
  getTruckById,
} from '../controllers/truckController.js';

const router = express.Router();

/* GET ALL */
router.get('/', getTrucks);

/* GET SINGLE */
router.get('/:id', getTruckById);

/* CREATE */
router.post('/', createTruck);

/* UPDATE STATUS */
router.patch(
  '/:id/status',
  updateTruckStatus
);

export default router;