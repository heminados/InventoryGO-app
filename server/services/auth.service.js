import prisma from '../config/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { validateUser } from '../models/user.model.js';

dotenv.config();

export const loginUser = async (email, password) => {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        return { status: 404, data: { message: 'User not found' } };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return { status: 401, data: { message: 'Invalid password' } };
    }

    if (!user.is_active) {
        return { status: 403, data: { message: 'Your account has been deactivated. Please contact your manager.' } };
    }

    const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return {
        status: 200,
        data: {
            message: 'Login successful',
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
        },
    };
};

export const adminLoginUser = async (email, password) => {
    const user = await prisma.user.findFirst({
        where: { email, role: 'ADMIN' },
    });

    if (!user) {
        return { status: 404, data: { message: 'User not found' } };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return { status: 401, data: { message: 'Invalid password' } };
    }

    const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return {
        status: 200,
        data: {
            message: 'Admin login successful',
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
        },
    };
};

export const registerUser = async (name, email, password) => {
    const { valid, errors } = validateUser({ name, email, password });
    if (!valid) {
        return { status: 400, data: { message: 'Validation failed', errors } };
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        return { status: 409, data: { message: 'Email already exists' } };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: { name, email, password: hashedPassword },
        select: { id: true, name: true, email: true, role: true, is_active: true },
    });

    return {
        status: 201,
        data: { message: 'User created successfully', user },
    };
};
