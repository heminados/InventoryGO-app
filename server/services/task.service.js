import prisma from '../config/prisma.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

// Decides whether a task should still be shown in the mobile app.
// - Completed tasks stay visible for 12 hours after completion, then drop off.
// - Other tasks drop off once they are overdue (past the end of their due date).
const isVisibleOnMobile = (task, now) => {
    if (task.status === 'DONE') {
        if (!task.completed_at) return true; // no timestamp yet — keep showing
        return now - new Date(task.completed_at).getTime() <= TWELVE_HOURS_MS;
    }
    if (task.due_date) {
        const endOfDueDate = new Date(task.due_date).getTime() + DAY_MS; // due_date is midnight -> +1 day = end of that day
        if (now > endOfDueDate) return false;
    }
    return true;
};

// Returns tasks assigned to a specific user via the junction table (mobile client).
// Overdue and long-completed tasks are hidden here so they disappear from the app UI,
// while still remaining in the database and the admin panel.
export const getTasksForUser = async (userId) => {
    const tasks = await prisma.task.findMany({
        where: {
            assignments: { some: { user_id: userId } },
        },
        orderBy: { created_at: 'desc' },
    });

    const now = Date.now();
    return tasks.filter((task) => isVisibleOnMobile(task, now));
};

export const completeTask = async (taskId, userId) => {
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: { assignments: true },
    });

    if (!task) {
        return { status: 404, data: { message: 'Task not found' } };
    }

    const isAssigned = task.assignments.some((a) => a.user_id === userId);
    if (!isAssigned) {
        return { status: 403, data: { message: 'Not authorized to complete this task' } };
    }

    if (task.status === 'DONE') {
        return { status: 400, data: { message: 'Task is already completed' } };
    }

    const updated = await prisma.task.update({
        where: { id: taskId },
        data: { status: 'DONE', completed_at: new Date() },
    });

    return { status: 200, data: updated };
};

// Returns all tasks with full assignee info (admin panel)
export const getAllTasks = async () => {
    return prisma.task.findMany({
        include: {
            creator: { select: { id: true, name: true, email: true } },
            assignments: {
                include: {
                    user: { select: { id: true, name: true, email: true } },
                },
            },
        },
        orderBy: { created_at: 'desc' },
    });
};

export const createTask = async ({ title, description, due_date, assignee_ids, created_by }) => {
    const task = await prisma.task.create({
        data: {
            title,
            description: description || null,
            due_date: due_date ? new Date(due_date) : null,
            created_by,
            assignments: {
                create: assignee_ids.map((user_id) => ({ user_id })),
            },
        },
        include: {
            creator: { select: { id: true, name: true, email: true } },
            assignments: {
                include: { user: { select: { id: true, name: true, email: true } } },
            },
        },
    });

    if (assignee_ids.length > 0) {
        await prisma.notification.createMany({
            data: assignee_ids.map((user_id) => ({
                user_id,
                task_id: task.id,
                title: `New Task: ${title}`,
                message: `You have been assigned a new task: "${title}". Due: ${due_date ? new Date(due_date).toLocaleDateString('en-GB') : 'No deadline'}.`,
            })),
        });
    }

    return task;
};

export const updateTask = async (taskId, { title, description, due_date, status, assignee_ids }) => {
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: { assignments: true },
    });

    if (!task) {
        return { status: 404, data: { message: 'Task not found' } };
    }

    const existingAssigneeIds = task.assignments.map((a) => a.user_id);
    const newAssigneeIds = assignee_ids !== undefined ? assignee_ids : existingAssigneeIds;
    const addedAssignees = newAssigneeIds.filter((id) => !existingAssigneeIds.includes(id));

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (due_date !== undefined) updateData.due_date = due_date ? new Date(due_date) : null;
    if (status !== undefined) {
        updateData.status = status;
        // Keep completed_at in sync so the mobile 12-hour rule works for admin changes too
        if (status === 'DONE' && task.status !== 'DONE') {
            updateData.completed_at = new Date();
        } else if (status !== 'DONE') {
            updateData.completed_at = null;
        }
    }

    updateData.assignments = {
        deleteMany: {},
        create: newAssigneeIds.map((user_id) => ({ user_id })),
    };

    const updated = await prisma.$transaction(async (tx) => {
        const updatedTask = await tx.task.update({
            where: { id: taskId },
            data: updateData,
            include: {
                creator: { select: { id: true, name: true, email: true } },
                assignments: {
                    include: { user: { select: { id: true, name: true, email: true } } },
                },
            },
        });

        if (addedAssignees.length > 0) {
            await tx.notification.createMany({
                data: addedAssignees.map((user_id) => ({
                    user_id,
                    task_id: taskId,
                    title: `Task Assigned: ${updatedTask.title}`,
                    message: `You have been assigned to task: "${updatedTask.title}".`,
                })),
            });
        }

        return updatedTask;
    });

    return { status: 200, data: updated };
};

export const cancelTask = async (taskId) => {
    const task = await prisma.task.findUnique({ where: { id: taskId } });

    if (!task) {
        return { status: 404, data: { message: 'Task not found' } };
    }

    if (task.status === 'CANCELLED') {
        return { status: 400, data: { message: 'Task is already cancelled' } };
    }

    const updated = await prisma.task.update({
        where: { id: taskId },
        data: { status: 'CANCELLED' },
        include: {
            creator: { select: { id: true, name: true, email: true } },
            assignments: {
                include: { user: { select: { id: true, name: true, email: true } } },
            },
        },
    });

    return { status: 200, data: updated };
};
