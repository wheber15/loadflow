import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

import connectDB from './config/db.js';

import truckRoutes from './routes/truckRoutes.js';
import palletRoutes from './routes/palletRoutes.js';
import floorRoutes from './routes/floorRoutes.js';
import bulkRoutes from './routes/bulkRoutes.js';
import pickingSessionRoutes from './routes/pickingSessionRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

connectDB();

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

app.set('io', io);

/* =========================
   MIDDLEWARE
========================= */

app.use(cors());

app.use(express.json());

/* =========================
   API ROUTES
========================= */

app.use(
  '/api/trucks',
  truckRoutes
);

app.use(
  '/api/pallets',
  palletRoutes
);

app.use(
  '/api/floor',
  floorRoutes
);

app.use(
  '/api/bulk',
  bulkRoutes
);

app.use(
  '/api/picking-sessions',
  pickingSessionRoutes
);

app.use(
  '/api/auth',
  authRoutes
);

/* =========================
   HEALTH CHECK
========================= */

app.get('/', (req, res) => {
  res.send(
    'LoadFlow API Running'
  );
});

/* =========================
   SOCKET.IO
========================= */

io.on(
  'connection',
  (socket) => {
    console.log(
      'Socket Connected:',
      socket.id
    );

    socket.on(
      'disconnect',
      () => {
        console.log(
          'Socket Disconnected'
        );
      }
    );
  }
);

/* =========================
   START SERVER
========================= */

const PORT =
  process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});