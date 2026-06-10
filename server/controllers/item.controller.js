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
    const { sku, name, description, price, qty } = req.body;
    try {
        const item = await itemService.updateItem(id, sku, name, description, price, qty);
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
