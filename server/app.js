import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import itemRoutes from './routes/item.routes.js';
import taskRoutes from './routes/task.routes.js';
import orderRoutes from './routes/order.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import userRoutes from './routes/user.routes.js';
import reportRoutes from './routes/report.routes.js';

const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/items', itemRoutes);
app.use('/tasks', taskRoutes);
app.use('/orders', orderRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/users', userRoutes);
app.use('/reports', reportRoutes);

export default app;