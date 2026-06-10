import * as dashboardService from '../services/dashboard.service.js';

export const getStats = async (req, res) => {
    try {
        const stats = await dashboardService.getDashboardStats(req.user.id);
        return res.status(200).json(stats);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
