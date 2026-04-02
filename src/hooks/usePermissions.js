import { useMemo } from 'react';
import { useAuth } from './useAuth';

const normalizeAction = (action) => {
  if (!action) return '';

  if (action === 'get') return 'read';

  return String(action).toLowerCase();
};

const getUserPermissions = (user) => {
  if (!user) return [];

  if (Array.isArray(user.permissions)) {
    return user.permissions;
  }

  if (Array.isArray(user.role?.permissions)) {
    return user.role.permissions;
  }

  if (Array.isArray(user.roleId?.permissions)) {
    return user.roleId.permissions;
  }

  return [];
};

function usePermissions(moduleName) {
  const { user, loading } = useAuth();

  const permissionState = useMemo(() => {
    const permissions = getUserPermissions(user);
    const modulePermission = permissions.find(
      (permission) => permission?.module === moduleName
    );

    const allowedActions = new Set(
      (modulePermission?.actions || []).map(normalizeAction)
    );

    const can = (action) => allowedActions.has(normalizeAction(action));

    return {
      user,
      loading,
      permissions,
      modulePermission,
      actions: Array.from(allowedActions),
      can,
      canCreate: can('create'),
      canRead: can('read'),
      canUpdate: can('update'),
      canDelete: can('delete'),
      hasAccess: allowedActions.size > 0,
    };
  }, [user, loading, moduleName]);

  return permissionState;
}

export default usePermissions;
