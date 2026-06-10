import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import prisma from '../config/prisma.js';

dotenv.config();

export const verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Re-check account status on every request — catches accounts deactivated after login.
        // Express 5 handles async middleware natively, so no extra wrapper needed.
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { is_active: true },
        });

        if (!user || !user.is_active) {
            return res.status(403).json({ message: 'Your account has been deactivated. Please contact your manager.' });
        }

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token.' });
    }
};
