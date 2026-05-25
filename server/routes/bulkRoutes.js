import express from 'express';

import {
  getBulkOrders,
  createBulkOrder,
  activateBulkOrder,
} from '../controllers/bulkController.js';

const router = express.Router();

/* =========================
   GET BULK ORDERS
========================= */
router.get(
  '/',
  getBulkOrders
);

/* =========================
   CREATE BULK ORDER
========================= */
router.post(
  '/',
  createBulkOrder
);

/* =========================
   ACTIVATE BULK ORDER
========================= */
router.patch(
  '/:id/activate',
  activateBulkOrder
);

export default router;