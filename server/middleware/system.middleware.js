import { getSettings } from '../services/settings.service.js';

// Blocks requests while the system is disabled from the Back Office.
// Admins and managers always pass, so they can keep working and re-enable it.
export const checkSystemEnabled = async (req, res, next) => {
    if (req.user.role === 'ADMIN' || req.user.role === 'MANAGER') return next();

    const settings = await getSettings();
    if (!settings.system_enabled) {
        return res.status(503).json({ message: 'The system is temporarily disabled. Please try again later.' });
    }
    next();
};
