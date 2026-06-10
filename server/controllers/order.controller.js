import * as orderService from '../services/order.service.js';

export const createOrder = async (req, res) => {
    const { customer_name, customer_phone, items } = req.body;
    try {
        const { status, data } = await orderService.createOrder(
            req.user.id,
            customer_name,
            customer_phone,
            items
        );
        return res.status(status).json(data);
    } catch (error) {
        console.error('Error creating order:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getPendingOrders = async (req, res) => {
    try {
        const orders = await orderService.getPendingOrders();
        return res.status(200).json(orders);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        const orders = await orderService.getAllOrders();
        return res.status(200).json(orders);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const approveOrder = async (req, res) => {
    const orderId = Number(req.params.id);
    try {
        const { status, data } = await orderService.approveOrder(orderId);
        return res.status(status).json(data);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const cancelOrder = async (req, res) => {
    const orderId = Number(req.params.id);
    try {
        const { status, data } = await orderService.cancelOrder(orderId);
        return res.status(status).json(data);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateOrder = async (req, res) => {
    const orderId = Number(req.params.id);
    const { customer_name, customer_phone, items } = req.body;
    try {
        const { status, data } = await orderService.updateOrder(orderId, {
            customer_name,
            customer_phone,
            items,
        });
        return res.status(status).json(data);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
