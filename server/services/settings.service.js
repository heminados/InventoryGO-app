import prisma from '../config/prisma.js';

// Defaults used for any key not yet stored in the table
const DEFAULTS = {
    system_enabled: true,
    offline_mode_enabled: true,
};

export const SETTING_KEYS = Object.keys(DEFAULTS);

// Returns all settings as a flat object, e.g. { system_enabled: true, offline_mode_enabled: true }
export const getSettings = async () => {
    const rows = await prisma.systemSetting.findMany();
    const settings = { ...DEFAULTS };
    for (const row of rows) settings[row.key] = row.value;
    return settings;
};

// Creates or updates a single setting row, then returns the full settings object
export const updateSetting = async (key, value) => {
    await prisma.systemSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
    });
    return getSettings();
};
