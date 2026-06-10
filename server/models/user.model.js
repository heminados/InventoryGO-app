import prisma from '../config/prisma.js';

export const createUser = async (user) => {
    const { name, email, password, role, is_active } = user;
    return prisma.user.create({
        data: { name, email, password, ...(role && { role }), is_active: is_active ?? true },
        select: { id: true, name: true, email: true, role: true, is_active: true, created_at: true },
    });
};

export const getUserByEmail = async (email) => {
    return prisma.user.findUnique({ where: { email } });
};

export const getUserById = async (id) => {
    return prisma.user.findUnique({ where: { id: Number(id) } });
};

export const getAllUsers = async () => {
    return prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, is_active: true, created_at: true },
        orderBy: { created_at: 'desc' },
    });
};

export const updateUser = async (id, user) => {
    const { name, email, role, is_active } = user;
    const data = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (role !== undefined) data.role = role;
    if (is_active !== undefined) data.is_active = is_active;
    return prisma.user.update({
        where: { id: Number(id) },
        data,
        select: { id: true, name: true, email: true, role: true, is_active: true, created_at: true },
    });
};

export const updateUserPassword = async (id, hashedPassword) => {
    return prisma.user.update({
        where: { id: Number(id) },
        data: { password: hashedPassword },
    });
};

export const deleteUser = async (id) => {
    return prisma.user.delete({ where: { id: Number(id) } });
};

export const validateUser = (user) => {
    const errors = {};
    const { name, email, password } = user;

    if (!name || name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters long';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        errors.email = 'Invalid email format';
    }

    if (!password || password.length < 6) {
        errors.password = 'Password must be at least 6 characters long';
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors,
    };
};
