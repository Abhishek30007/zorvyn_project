const APP_ROLES = {
  ADMIN: 'admin',
  ANALYST: 'analyst',
  USER: 'user',
};

const normalizeRole = (role) => {
  const value = String(role || '').toLowerCase();

  if (value === APP_ROLES.ADMIN) return APP_ROLES.ADMIN;
  if (value === APP_ROLES.ANALYST) return APP_ROLES.ANALYST;
  if (value === 'viewer') return APP_ROLES.USER;

  return APP_ROLES.USER;
};

module.exports = {
  APP_ROLES,
  normalizeRole,
};
