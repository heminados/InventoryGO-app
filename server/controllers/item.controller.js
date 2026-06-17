import * as itemService from '../services/item.service.js';

export const addItem = async (req, res) => {
    const { sku, name, description, price, qty } = req.body;
    try {
        const item = await itemService.addItem(sku, name, description, price, qty);
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateItem = async (req, res) => {
    const { id } = req.params;
    const { sku, name, description, price, qty, is_ordered } = req.body;
    try {
        // Items flagged for inspection (is_ordered) are locked for employees.
        // Only admins/managers can change them — including clearing the flag.
        if (req.user.role === 'EMPLOYEE') {
            const existing = await itemService.getItemById(id);
            if (existing?.is_ordered) {
                return res.status(403).json({
                    message: 'This item requires inspection and is locked. Please contact a manager.',
                });
            }
        }
        const item = await itemService.updateItem(id, sku, name, description, price, qty, is_ordered);
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
