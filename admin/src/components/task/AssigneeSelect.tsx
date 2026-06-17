// A multi-select dropdown for choosing which employees a task is assigned to.
// Used by both EditTaskDrawer and CreateTaskDialog so the picker looks and
// behaves the same in both places. The parent passes the employee list, the
// currently selected ids, and gets the new id list back through onChange.
import {
  Box, Typography, Select, MenuItem, FormControl, InputLabel, Avatar, SelectChangeEvent,
} from '@mui/material';
import { Employee } from './types';

interface AssigneeSelectProps {
  label: string;
  employees: Employee[];
  value: number[];
  onChange: (ids: number[]) => void;
}

export default function AssigneeSelect({ label, employees, value, onChange }: AssigneeSelectProps) {
  const handleChange = (e: SelectChangeEvent<number[]>) => {
    const selected = e.target.value;
    onChange(typeof selected === 'string' ? [] : (selected as number[]));
  };

  return (
    <FormControl size="small" fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select
        multiple
        value={value}
        label={label}
        onChange={handleChange}
        renderValue={(selected) =>
          employees
            .filter((emp) => (selected as number[]).includes(emp.id))
            .map((emp) => emp.name)
            .join(', ')
        }
      >
        {employees.map((emp) => (
          <MenuItem key={emp.id} value={emp.id}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 24, height: 24, bgcolor: '#e0e7ff', color: '#4338ca', fontSize: 11, fontWeight: 700 }}>
                {emp.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="body2">{emp.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {emp.role.charAt(0) + emp.role.slice(1).toLowerCase()}
                </Typography>
              </Box>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
