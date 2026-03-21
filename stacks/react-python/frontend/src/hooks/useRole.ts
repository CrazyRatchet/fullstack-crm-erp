// src/hooks/useRole.ts

import { useAppSelector } from '../store/hooks';

export const Role = {
  SUPER_ADMIN: 'super_admin',
  BUSINESS_ADMIN: 'business_admin',
  MANAGER: 'manager',
  SALESPERSON: 'salesperson',
  ERP_OPERATOR: 'erp_operator',
  BASIC_USER: 'basic_user',
} as const;

// This type represents any valid role string
export type RoleType = (typeof Role)[keyof typeof Role];

// useRole hook — returns helper functions to check the current user's role
export function useRole() {
  const user = useAppSelector((state) => state.auth.user);

  const hasRole = (...roles: RoleType[]): boolean => {
    if (!user?.role) return false;
    return roles.includes(user.role as RoleType);
  };

  const hasAllRoles = (...roles: RoleType[]): boolean => {
    if (!user?.role) return false;
    return roles.includes(user.role as RoleType);
  };

  const isAtLeastManager = (): boolean => {
    return hasRole(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN, Role.MANAGER);
  };

  const isAdmin = (): boolean => {
    return hasRole(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN);
  };

  return {
    role: user?.role,
    hasRole,
    hasAllRoles,
    isAtLeastManager,
    isAdmin,
  };
}
