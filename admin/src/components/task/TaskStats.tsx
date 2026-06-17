// The four summary cards above the table (Total / Pending / In Progress /
// Completed). TaskManage.tsx passes the full task list and this component
// counts the numbers for each card itself.
import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Task } from './types';

// A single summary card: coloured icon on the left, number + label on the right.
function StatCard({ icon, label, value, iconBg }: {
  icon: React.ReactNode; label: string; value: number; iconBg: string;
}) {
  return (
    <Card variant="outlined" sx={{ flex: 1, borderRadius: 2 }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ bgcolor: iconBg, borderRadius: 2, p: 1.25, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{value}</Typography>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function TaskStats({ tasks }: { tasks: Task[] }) {
  const totalTasks   = tasks.length;
  const pendingTasks = tasks.filter((t) => t.status === 'OPEN').length;
  const activeTasks  = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const doneTasks    = tasks.filter((t) => t.status === 'DONE').length;

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
      <StatCard
        icon={<AssignmentIcon sx={{ color: '#3b82f6', fontSize: 22 }} />}
        iconBg="#eff6ff"
        label="Total Tasks"
        value={totalTasks}
      />
      <StatCard
        icon={<HourglassEmptyIcon sx={{ color: '#ca8a04', fontSize: 22 }} />}
        iconBg="#fefce8"
        label="Pending"
        value={pendingTasks}
      />
      <StatCard
        icon={<AccessTimeIcon sx={{ color: '#7c3aed', fontSize: 22 }} />}
        iconBg="#f5f3ff"
        label="In Progress"
        value={activeTasks}
      />
      <StatCard
        icon={<CheckCircleIcon sx={{ color: '#16a34a', fontSize: 22 }} />}
        iconBg="#f0fdf4"
        label="Completed"
        value={doneTasks}
      />
    </Box>
  );
}
