import { loginUser, adminLoginUser, registerUser } from '../services/auth.service.js';

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const { status, data } = await loginUser(email, password);
        return res.status(status).json(data);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const adminLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const { status, data } = await adminLoginUser(email, password);
        return res.status(status).json(data);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const register = async (req, res) => {
    const { email, password, name } = req.body;
    try {
        const { status, data } = await registerUser(name, email, password);
        return res.status(status).json(data);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
