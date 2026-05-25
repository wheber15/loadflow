import express from 'express';

import {
  loginUser,
  logoutUser,
  createUser,
  getUsers,
  updateUserActivity,
} from '../controllers/authController.js';

const router = express.Router();

/* =========================
   LOGIN
========================= */

router.post(
  '/login',
  loginUser
);

/* =========================
   LOGOUT
========================= */

router.post(
  '/logout/:id',
  logoutUser
);

/* =========================
   CREATE USER
========================= */

router.post(
  '/create',
  createUser
);

/* =========================
   GET USERS
========================= */

router.get(
  '/',
  getUsers
);

/* =========================
   UPDATE ACTIVITY
========================= */

router.put(
  '/activity/:id',
  updateUserActivity
);

export default router;