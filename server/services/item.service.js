import prisma from '../config/prisma.js';

export const addItem = async (sku, name, description, price, qty) => {
    return prisma.item.create({
        data: { sku, name, description, price, qty },
    });
};

// is_ordered is reused as the "requires inspection" flag (no schema change).
// When undefined (e.g. the mobile client doesn't send it) Prisma leaves it untouched.
export const updateItem = async (id, sku, name, description, price, qty, is_ordered) => {
    return prisma.item.update({
        where: { id: Number(id) },
        data: { sku, name, description, price, qty, is_ordered },
    });
};

export const deleteItem = async (id) => {
    await prisma.item.delete({ where: { id: Number(id) } });
};

export const getItemById = async (id) => {
    return prisma.item.findUnique({ where: { id: Number(id) } });
};

export const getAllItems = async () => {
    return prisma.item.findMany();
};

export const getItemDetails = async (id) => {
    const item = await prisma.item.findUnique({
        where: { id: Number(id) },
        include: {
            order_items: {
                where: {
                    order: { status: { in: ['PENDING', 'APPROVED'] } },
                },
                select: { quantity: true },
            },
        },
    });

    if (!item) return null;

    const reserved_qty = item.order_items.reduce((sum, oi) => sum + oi.quantity, 0);

    return {
        id: item.id,
        sku: item.sku,
        name: item.name,
        description: item.description,
        price: item.price,
        qty: item.qty,
        reserved_qty,
        available_qty: Math.max(0, item.qty - reserved_qty),
        is_on_order: reserved_qty > 0,
    };
};
