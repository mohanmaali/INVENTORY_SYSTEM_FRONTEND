export const MODULES = [
  'dashboard',
  'inventory',
  'reports',
  'roles',
  'users',
  'settings',
  "suppliers",
  "orders",
  "customers",
];

export const AVAILABLE_ACTIONS = ['create', 'update', 'delete', 'get'];

export const initialRoleForm = {
  name: '',
  description: '',
  permissions: [],
};

export const mapApiActionToUi = (action) => (action === 'read' ? 'get' : action);

export const mapUiActionToApi = (action) => (action === 'get' ? 'read' : action);
