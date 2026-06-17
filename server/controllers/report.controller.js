import * as reportService from '../services/report.service.js';

// Read-only: returns all inventory reports for the audit page.
export const getAllReports = async (req, res) => {
    try {
        const reports = await reportService.getAllReports();
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
