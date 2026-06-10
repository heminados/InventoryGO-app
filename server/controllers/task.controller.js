import * as taskService from '../services/task.service.js';

export const getMyTasks = async (req, res) => {
    try {
        const tasks = await taskService.getTasksForUser(req.user.id);
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const completeTask = async (req, res) => {
    const taskId = Number(req.params.id);
    try {
        const { status, data } = await taskService.completeTask(taskId, req.user.id);
        res.status(status).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getAllTasks = async (req, res) => {
    try {
        const tasks = await taskService.getAllTasks();
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const createTask = async (req, res) => {
    const { title, description, due_date, assignee_ids } = req.body;

    if (!title || title.trim().length < 2) {
        return res.status(400).json({ message: 'Title must be at least 2 characters' });
    }
    if (!assignee_ids || !Array.isArray(assignee_ids) || assignee_ids.length === 0) {
        return res.status(400).json({ message: 'At least one assignee is required' });
    }

    try {
        const task = await taskService.createTask({
            title: title.trim(),
            description: description?.trim() || null,
            due_date: due_date || null,
            assignee_ids: assignee_ids.map(Number),
            created_by: req.user.id,
        });
        return res.status(201).json(task);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateTask = async (req, res) => {
    const taskId = Number(req.params.id);
    const { title, description, due_date, status, assignee_ids } = req.body;

    try {
        const { status: httpStatus, data } = await taskService.updateTask(taskId, {
            title: title !== undefined ? title.trim() : undefined,
            description: description !== undefined ? description.trim() : undefined,
            due_date,
            status,
            assignee_ids: assignee_ids !== undefined ? assignee_ids.map(Number) : undefined,
        });
        return res.status(httpStatus).json(data);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const cancelTask = async (req, res) => {
    const taskId = Number(req.params.id);
    try {
        const { status, data } = await taskService.cancelTask(taskId);
        return res.status(status).json(data);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
