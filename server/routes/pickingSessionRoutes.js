import express from 'express';

import {
  startPickingSession,
  completePickingSession,
  getActivePickingSessions,
} from '../controllers/pickingSessionController.js';

const router = express.Router();

/* =========================
   START SESSION
========================= */

router.post(
  '/start',
  startPickingSession
);

/* =========================
   COMPLETE SESSION
========================= */

router.put(
  '/complete/:id',
  completePickingSession
);

/* =========================
   ACTIVE SESSIONS
========================= */

router.get(
  '/active',
  getActivePickingSessions
);

export default router;