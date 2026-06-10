export const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'MANAGER') {
        return res.status(403).json({ message: 'Access denied. Admin or Manager required.' });
    }
    next();
};
