import prisma from '../config/prisma.js';

// Returns a single summary object used by the admin dashboard.
// All eight values are computed in one parallel batch — no table is fully loaded into memory.
export const getDashboardStats = async (userId) => {
    const [
        stockResult, 
        openOrders, 
        pendingOrders, 
        lowStockAlerts, 
        requiredToCheck, 
        tasks, 
        openTasks, 
        completedTasks
        ] = await Promise.all([
        // Sum of qty across all inventory items
        prisma.item.aggregate({ _sum: { qty: true } }),

        // "Open" orders = APPROVED status (the OrderStatus enum has no OPEN value;
        // APPROVED means the order has been accepted and is being processed)
        prisma.order.count({ where: { status: 'APPROVED' } }),

        // Orders waiting for approval
        prisma.order.count({ where: { status: 'PENDING' } }),

        // Products low in stock — qty at or below the safety threshold of 5
        prisma.item.count({ where: { qty: { lte: 5 } } }),

        // Products whose stock has gone negative — need immediate attention
        prisma.item.count({ where: { qty: { lt: 0 } } }),

        // Active tasks assigned to the requesting user via the junction table (excludes DONE and CANCELLED)
        prisma.task.count({
            where: {
                assignments: { some: { user_id: userId } },
                status: { notIn: ['DONE', 'CANCELLED'] },
            },
        }),

        // All tasks that are still in progress (OPEN or IN_PROGRESS) across the whole system
        prisma.task.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),

        // All tasks that have been completed
        prisma.task.count({ where: { status: 'DONE' } }),
    ]);

    return {
        totalStock: stockResult._sum.qty ?? 0,
        openOrders,
        pendingOrders,
        lowStockAlerts,
        requiredToCheck,
        tasks,
        openTasks,
        completedTasks,
    };
};
