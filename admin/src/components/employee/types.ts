// Shared types for the user-management page and its sub-components.
// EmployeeManage.tsx and the components in this folder all import from here.

// The three roles that match the backend Role enum
export type Role = 'ADMIN' | 'EMPLOYEE' | 'MANAGER';

// One user as returned by GET /users
export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  is_active: boolean;
  created_at: string;
}

// Values edited in the Edit User drawer
export interface EditUserForm {
  name: string;
  email: string;
  role: Role;
  is_active: boolean;
}

// Values entered in the Add User dialog
export interface AddUserForm {
  name: string;
  email: string;
  password: string;
  role: Role;
}
