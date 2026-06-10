import bcrypt from 'bcrypt';
import { getAllUsers, getUserById, createUser, updateUser, updateUserPassword, deleteUser, validateUser } from '../models/user.model.js';

export const getUsers = async (req, res) => {
    try {
        const users = await getAllUsers();
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getUser = async (req, res) => {
    try {
        const user = await getUserById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        const { password, ...safe } = user;
        return res.status(200).json(safe);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const addUser = async (req, res) => {
    const { name, email, password, role, is_active } = req.body;
    const { valid, errors } = validateUser({ name, email, password });
    if (!valid) return res.status(400).json({ message: 'Validation failed', errors });
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await createUser({ name, email, password: hashedPassword, role, is_active });
        return res.status(201).json({ message: 'User created', user });
    } catch (error) {
        if (error.code === 'P2002') return res.status(409).json({ message: 'Email already exists' });
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const editUser = async (req, res) => {
    const { name, email, role, is_active } = req.body;
    try {
        const user = await updateUser(req.params.id, { name, email, role, is_active });
        return res.status(200).json({ message: 'User updated', user });
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ message: 'User not found' });
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const removeUser = async (req, res) => {
    try {
        await deleteUser(req.params.id);
        return res.status(200).json({ message: 'User deleted' });
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ message: 'User not found' });
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const user = await getUserById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const tempPassword = Math.random().toString(36).slice(-8);
        const hashed = await bcrypt.hash(tempPassword, 10);
        await updateUserPassword(req.params.id, hashed);

        return res.status(200).json({
            message: 'Password reset successful',
            temp_password: tempPassword,
            email: user.email,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
