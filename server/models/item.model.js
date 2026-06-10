import prisma from '../config/prisma.js';

export const createItem = async (item) => {
    const { sku, name, description, price, qty } = item;
    return prisma.item.create({ data: { sku, name, description, price, qty } });
};

export const updateItem = async (id, item) => {
    const { sku, name, description, price, qty } = item;
    return prisma.item.update({
        where: { id: Number(id) },
        data: { sku, name, description, price, qty },
    });
};

export const getAllItems = async () => {
    return prisma.item.findMany();
};

export const getItemById = async (id) => {
    return prisma.item.findUnique({ where: { id: Number(id) } });
};

export const deleteItem = async (id) => {
    return prisma.item.delete({ where: { id: Number(id) } });
};
