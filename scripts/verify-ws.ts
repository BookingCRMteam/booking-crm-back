import { io } from 'socket.io-client';
import * as dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:3000';
const TOKEN = process.env.TEST_AUTH_TOKEN || process.argv[2];

if (!TOKEN) {
  console.error(
    'Please provide TEST_AUTH_TOKEN in .env or pass it as an argument',
  );
  console.error('Usage: npx ts-node scripts/verify-ws.ts <token>');
  process.exit(1);
}

const socket = io(`${API_URL}/bookings`, {
  extraHeaders: {
    Authorization: `Bearer ${TOKEN}`,
  },
});

socket.on('connect', () => {
  console.log('Connected to WebSocket server');
});

socket.on('connect_error', (err) => {
  console.error('Connection error:', err.message);
});

socket.on('bookingStatusChange', (data) => {
  console.log('Received bookingStatusChange event:', data);
});

socket.on('disconnect', () => {
  console.log('Disconnected from WebSocket server');
});

// Keep the script running
setInterval(() => {}, 1000);
