import crypto from 'crypto';

import User from '../models/User.js';

/* =========================
   LOGIN
========================= */

export const loginUser =
  async (req, res) => {
    try {
      const { name, pin } =
        req.body;

      if (!name || !pin) {
        return res.status(400).json({
          message:
            'Name and PIN required',
        });
      }

      /* =========================
         FIND USER
      ========================= */

      const user =
        await User.findOne({
          name,
          pin,
        });

      if (!user) {
        return res.status(401).json({
          message:
            'Invalid credentials',
        });
      }

      /* =========================
         FORCE LOGOUT OLD SESSION
      ========================= */

      user.isActiveSession =
        false;

      user.currentSessionId =
        '';

      /* =========================
         CREATE NEW SESSION
      ========================= */

      const sessionId =
        crypto.randomUUID();

      user.isActiveSession =
        true;

      user.currentSessionId =
        sessionId;

      user.lastLoginAt =
        new Date();

      await user.save();

      res.json({
        _id: user._id,
        name: user.name,
        role: user.role,
        sessionId,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message:
          'Login failed',
      });
    }
  };

/* =========================
   LOGOUT
========================= */

export const logoutUser =
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.params.id
        );

      if (!user) {
        return res.status(404).json({
          message:
            'User not found',
        });
      }

      user.isActiveSession =
        false;

      user.currentSessionId =
        '';

      await user.save();

      res.json({
        message:
          'Logged out successfully',
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message:
          'Logout failed',
      });
    }
  };

/* =========================
   CREATE USER
========================= */

export const createUser =
  async (req, res) => {
    try {
      const {
        name,
        pin,
        role,
      } = req.body;

      if (!name || !pin) {
        return res.status(400).json({
          message:
            'Missing required fields',
        });
      }

      const existing =
        await User.findOne({
          name,
        });

      if (existing) {
        return res.status(400).json({
          message:
            'User already exists',
        });
      }

      const user =
        await User.create({
          name,
          pin,
          role:
            role || 'PICKER',
        });

      res.status(201).json(
        user
      );
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message:
          'Failed to create user',
      });
    }
  };

/* =========================
   GET USERS
========================= */

export const getUsers =
  async (req, res) => {
    try {
      const users =
        await User.find().sort({
          createdAt: -1,
        });

      res.json(users);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message:
          'Failed to fetch users',
      });
    }
  };