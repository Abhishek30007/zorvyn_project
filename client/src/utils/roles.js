export const APP_ROLES = {
  ADMIN: 'admin',
  ANALYST: 'analyst',
  USER: 'user',
};

export const normalizeRole = (role) => {
  const value = String(role || '').toLowerCase();

  if (value === APP_ROLES.ADMIN) return APP_ROLES.ADMIN;
  if (value === APP_ROLES.ANALYST) return APP_ROLES.ANALYST;
  if (value === 'viewer') return APP_ROLES.USER;
  if (value === APP_ROLES.USER) return APP_ROLES.USER;

  return APP_ROLES.USER;
};

export const getRoleLabel = (role) => {
  const normalized = normalizeRole(role);

  if (normalized === APP_ROLES.ADMIN) return 'Admin';
  if (normalized === APP_ROLES.ANALYST) return 'Analyst';

  return 'Viewer';
};

export const canManageTransactions = (role) => normalizeRole(role) === APP_ROLES.ADMIN;

export const canManageUsers = (role) => normalizeRole(role) === APP_ROLES.ADMIN;

export const hasGlobalAccess = (role) => {
  const normalized = normalizeRole(role);
  return normalized === APP_ROLES.ADMIN || normalized === APP_ROLES.ANALYST;
};

export const canViewTransactions = () => true;
