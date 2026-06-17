import * as itemService from '../services/item.service.js';
import * as reportService from '../services/report.service.js';

// Reporting must never break an inventory operation, so we run it best-effort.
const safeReport = async (fn) => {
    try {
        await fn();
    } catch (error) {
        console.error('Failed to create report:', error.message);
    }
};

// The admin web app sends source: 'admin'; everything else (the mobile client) defaults to 'client'.
const resolveSource = (source) => (source === 'admin' ? 'admin' : 'client');

export const addItem = async (req, res) => {
    const { sku, name, description, price, qty, source } = req.body;
    try {
        const item = await itemService.addItem(sku, name, description, price, qty);
        await safeReport(() => reportService.createReport({
            issued_by: req.user.id,
            action: 'Product added',
            status: 'NORMAL',
            source: resolveSource(source),
            item,
            details: `New product created with initial stock of ${item.qty}.`,
        }));
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateItem = async (req, res) => {
    const { id } = req.params;
    const { sku, name, description, price, qty, is_ordered, source } = req.body;
    const appSource = resolveSource(source);
    try {
        const existing = await itemService.getItemById(id);
        if (!existing) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Items flagged for inspection (is_ordered) are locked for employees.
        // Only admins/managers can change them — including clearing the flag.
        if (req.user.role === 'EMPLOYEE' && existing.is_ordered) {
            return res.status(403).json({
                message: 'This item requires inspection and is locked. Please contact a manager.',
            });
        }

        // Stock can never go below 0 — reject the operation and log an Exception report.
        if (qty !== undefined && Number(qty) < 0) {
            await safeReport(() => reportService.createReport({
                issued_by: req.user.id,
                action: 'Stock removed',
                status: 'EXCEPTION',
                source: appSource,
                item: existing,
                exception_reason: `Attempted to set stock to ${qty}, below the minimum of 0. The operation was rejected.`,
            }));
            return res.status(422).json({ message: 'Stock cannot be reduced below 0.' });
        }

        const item = await itemService.updateItem(id, sku, name, description, price, qty, is_ordered);

        // Log a Normal report describing what changed (best-effort — never blocks the update).
        await safeReport(() => reportService.reportItemUpdate(existing, item, req.user.id, appSource));

        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deleteItem = async (req, res) => {
    const { id } = req.params;
    try {
        await itemService.deleteItem(id);
        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getItemById = async (req, res) => {
    const { itemId } = req.params;
    try {
        const item = await itemService.getItemById(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getAllItems = async (req, res) => {
    try {
        const items = await itemService.getAllItems();
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getItemDetails = async (req, res) => {
    const { itemId } = req.params;
    try {
        const item = await itemService.getItemDetails(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
