import express from 'express';
import chatRoutes from './chat.js';

const app = express();

app.use('/chat', chatRoutes);

export default app;