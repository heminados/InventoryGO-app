import prisma from '../config/prisma.js';

export const createOrder = async (userId, customerName, customerPhone, items) => {
    if (!customerName || customerName.trim().length < 2) {
        return { status: 400, data: { message: 'Customer name must be at least 2 characters' } };
    }

    if (!customerPhone || customerPhone.trim().length < 5) {
        return { status: 400, data: { message: 'Customer phone number is required' } };
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
        return { status: 400, data: { message: 'Order must contain at least one item' } };
    }

    for (const item of items) {
        if (!item.item_id || !Number.isInteger(Number(item.item_id)) || Number(item.item_id) < 1) {
            return { status: 400, data: { message: 'Each item must have a valid item_id' } };
        }
        if (!item.quantity || Number(item.quantity) < 1 || !Number.isInteger(Number(item.quantity))) {
            return { status: 400, data: { message: 'Each item quantity must be a positive integer' } };
        }
    }

    const itemIds = items.map((i) => Number(i.item_id));
    const dbItems = await prisma.item.findMany({ where: { id: { in: itemIds } } });

    if (dbItems.length !== itemIds.length) {
        return { status: 400, data: { message: 'One or more items were not found' } };
    }

    const itemMap = new Map(dbItems.map((i) => [i.id, i]));
    let allSufficient = true;

    for (const { item_id, quantity } of items) {
        const dbItem = itemMap.get(Number(item_id));
        if (dbItem.qty < Number(quantity)) {
            allSufficient = false;
            break;
        }
    }

    const orderStatus = allSufficient ? 'APPROVED' : 'PENDING';

    const order = await prisma.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
            data: {
                created_by: userId,
                status: orderStatus,
                customer_name: customerName.trim(),
                customer_phone: customerPhone.trim(),
                order_items: {
                    create: items.map(({ item_id, quantity }) => ({
                        item_id: Number(item_id),
                        quantity: Number(quantity),
                    })),
                },
            },
            include: {
                order_items: {
                    include: { item: { select: { id: true, sku: true, name: true } } },
                },
            },
        });

        if (allSufficient) {
            for (const { item_id, quantity } of items) {
                await tx.item.update({
                    where: { id: Number(item_id) },
                    data: { qty: { decrement: Number(quantity) } },
                });
            }
        }

        return newOrder;
    });

    const message = allSufficient
        ? 'Order approved and inventory updated'
        : 'Insufficient stock — order is pending manager approval';

    return { status: 201, data: { message, status: orderStatus, order } };
};

export const getPendingOrders = async () => {
    return prisma.order.findMany({
        where: { status: 'PENDING' },
        include: {
            creator: { select: { id: true, name: true, email: true } },
            order_items: {
                include: {
                    item: { select: { id: true, sku: true, name: true, price: true } },
                },
            },
        },
        orderBy: { created_at: 'desc' },
    });
};

// Returns all orders with full item and creator detail (admin panel)
export const getAllOrders = async () => {
    return prisma.order.findMany({
        include: {
            creator: { select: { id: true, name: true, email: true } },
            order_items: {
                include: {
                    item: { select: { id: true, sku: true, name: true, price: true } },
                },
                orderBy: { id: 'asc' },
            },
        },
        orderBy: { created_at: 'desc' },
    });
};

// Reuses the exact same stock-check logic as createOrder — the website behaves identically to the mobile app.
export const approveOrder = async (orderId) => {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { order_items: { include: { item: true } } },
    });

    if (!order) return { status: 404, data: { message: 'Order not found' } };
    if (order.status !== 'PENDING') {
        return { status: 400, data: { message: 'Only pending orders can be approved' } };
    }

    // Same per-item stock check that createOrder uses when auto-approving
    for (const oi of order.order_items) {
        if (oi.item.qty < oi.quantity) {
            return {
                status: 422,
                data: {
                    message: `Insufficient stock for "${oi.item.name}". Available: ${oi.item.qty}, required: ${oi.quantity}.`,
                },
            };
        }
    }

    const updated = await prisma.$transaction(async (tx) => {
        for (const oi of order.order_items) {
            await tx.item.update({
                where: { id: oi.item_id },
                data: { qty: { decrement: oi.quantity } },
            });
        }
        return tx.order.update({
            where: { id: orderId },
            data: { status: 'APPROVED' },
            include: {
                creator: { select: { id: true, name: true, email: true } },
                order_items: {
                    include: { item: { select: { id: true, sku: true, name: true, price: true } } },
                    orderBy: { id: 'asc' },
                },
            },
        });
    });

    return { status: 200, data: updated };
};

// Cancels an order. If it was already APPROVED, restores the inventory that was decremented.
export const cancelOrder = async (orderId) => {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { order_items: true },
    });

    if (!order) return { status: 404, data: { message: 'Order not found' } };
    if (order.status === 'CANCELLED' || order.status === 'COMPLETED') {
        return { status: 400, data: { message: 'This order cannot be cancelled' } };
    }

    const updated = await prisma.$transaction(async (tx) => {
        // Restore inventory only if the order had already been approved (stock was decremented)
        if (order.status === 'APPROVED') {
            for (const oi of order.order_items) {
                await tx.item.update({
                    where: { id: oi.item_id },
                    data: { qty: { increment: oi.quantity } },
                });
            }
        }

        return tx.order.update({
            where: { id: orderId },
            data: { status: 'CANCELLED' },
            include: {
                creator: { select: { id: true, name: true, email: true } },
                order_items: {
                    include: { item: { select: { id: true, sku: true, name: true, price: true } } },
                    orderBy: { id: 'asc' },
                },
            },
        });
    });

    return { status: 200, data: updated };
};

// Updates customer info and/or items. Items can only be changed on PENDING orders.
export const updateOrder = async (orderId, { customer_name, customer_phone, items }) => {
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) return { status: 404, data: { message: 'Order not found' } };
    if (order.status === 'CANCELLED' || order.status === 'COMPLETED') {
        return { status: 400, data: { message: 'Cancelled or completed orders cannot be edited' } };
    }
    if (items !== undefined && order.status !== 'PENDING') {
        return { status: 400, data: { message: 'Items can only be modified on pending orders' } };
    }

    const updated = await prisma.$transaction(async (tx) => {
        if (items !== undefined && items.length > 0) {
            await tx.orderItem.deleteMany({ where: { order_id: orderId } });
            await tx.orderItem.createMany({
                data: items.map(({ item_id, quantity }) => ({
                    order_id: orderId,
                    item_id: Number(item_id),
                    quantity: Number(quantity),
                })),
            });
        }

        const updateData = {};
        if (customer_name !== undefined) updateData.customer_name = customer_name.trim();
        if (customer_phone !== undefined) updateData.customer_phone = customer_phone.trim();

        return tx.order.update({
            where: { id: orderId },
            data: updateData,
            include: {
                creator: { select: { id: true, name: true, email: true } },
                order_items: {
                    include: { item: { select: { id: true, sku: true, name: true, price: true } } },
                    orderBy: { id: 'asc' },
                },
            },
        });
    });

    return { status: 200, data: updated };
};
