import * as settingsService from '../services/settings.service.js';

export const getSettings = async (req, res) => {
    try {
        const settings = await settingsService.getSettings();
        return res.status(200).json(settings);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateSetting = async (req, res) => {
    const { key, value } = req.body;

    if (!settingsService.SETTING_KEYS.includes(key)) {
        return res.status(400).json({ message: `Unknown setting: ${key}` });
    }
    if (typeof value !== 'boolean') {
        return res.status(400).json({ message: 'Setting value must be true or false.' });
    }

    try {
        const settings = await settingsService.updateSetting(key, value);
        return res.status(200).json(settings);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
