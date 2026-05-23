import { io } from 'socket.io-client';

const SOCKET_URL =
  window.location.hostname ===
  'localhost'
    ? 'http://localhost:5000'
    : `http://${window.location.hostname}:5000`;

const socket = io(SOCKET_URL);

export default socket;