import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

import connectDB from './config/db.js';

import truckRoutes from './routes/truckRoutes.js';
import palletRoutes from './routes/palletRoutes.js';

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

app.use(cors());
app.use(express.json());
app.use('/api/pallets', palletRoutes);


app.get('/', (req, res) => {
  res.send('LoadFlow API Running');
});

app.use('/api/trucks', truckRoutes);

io.on('connection', (socket) => {
  console.log('Socket Connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Socket Disconnected');
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});