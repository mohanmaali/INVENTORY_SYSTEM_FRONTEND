import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaEdit, FaEye, FaTrash } from 'react-icons/fa';
import { Button, Card, ConfirmationModal, Modal } from '../../components/ui';
import { getRoles, deleteRole } from '../../services/roles';
import { mapApiActionToUi } from './roleConfig';

function ListRoles() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [deletingId, setDeletingId] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [confirmDeleteRole, setConfirmDeleteRole] = useState(null);

  const loadRoles = async () => {
    setLoadingRoles(true);

    try {
      const data = await getRoles();
      setRoles(Array.isArray(data) ? data : []);
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to load roles';
      toast.error(message);
    } finally {
      setLoadingRoles(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const handleDelete = async (id) => {
    setDeletingId(id);

    try {
      await deleteRole(id);
      toast.success('Role deleted successfully');
      await loadRoles();
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to delete role';
      toast.error(message);
    } finally {
      setDeletingId('');
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Roles</h1>
          <p className="mt-1 text-sm text-gray-600">
            View, edit, and delete existing roles.
          </p>
        </div>
        <Button type="button" onClick={() => navigate('/roles/add')}>
          Add Role
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Role List</h2>
            {/* <p className="text-sm text-gray-500">
              Existing roles from <code>GET /api/roles</code>.
            </p> */}
          </div>
          <Button type="button" variant="secondary" onClick={loadRoles} disabled={loadingRoles}>
            {loadingRoles ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {loadingRoles ? (
          <p className="text-sm text-gray-500">Loading roles...</p>
        ) : roles.length === 0 ? (
          <p className="text-sm text-gray-500">No roles found.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3 font-semibold">Role Name</th>
                  <th className="px-4 py-3 font-semibold">Description</th>
                  <th className="px-4 py-3 font-semibold">Permissions</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {roles.map((role) => {
                  const roleId = role._id || role.id;

                  return (
                    <tr key={roleId} className="align-top hover:bg-gray-50">
                      <td className="px-4 py-4 font-medium text-gray-900">
                        {role.name}
                      </td>
                      <td className="px-4 py-4 text-gray-600">
                        {role.description || 'No description provided'}
                      </td>
                      <td className="px-4 py-4">
                        {(role.permissions || []).length > 0 ? (
                          <div className="min-w-[220px] max-w-md">
                            <div className="flex flex-wrap gap-2">
                              <span className="inline-flex min-w-[92px] justify-center rounded-md bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700">
                                {(role.permissions || []).length} modules
                              </span>
                              <Button
                                type="button"
                                variant="secondary"
                                className="inline-flex items-center gap-2 px-3 py-2 text-xs"
                                onClick={() => setSelectedRole(role)}
                              >
                                <FaEye className="h-3 w-3" />
                                View
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">
                            No permissions assigned
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            className="inline-flex items-center gap-2 px-3 py-1.5"
                            onClick={() => navigate(`/roles/${roleId}/edit`)}
                            disabled={deletingId === roleId}
                          >
                            <FaEdit className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            className="inline-flex items-center gap-2 px-3 py-1.5"
                            onClick={() =>
                              setConfirmDeleteRole({
                                id: roleId,
                                name: role.name || 'this role',
                              })
                            }
                            disabled={deletingId === roleId}
                          >
                            <FaTrash className="h-3.5 w-3.5" />
                            {deletingId === roleId ? 'Deleting...' : 'Delete'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        isOpen={Boolean(selectedRole)}
        onClose={() => setSelectedRole(null)}
        className="max-w-4xl"
      >
        {selectedRole && (
          <div className="p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedRole.name} Permissions
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Module-wise access for this role ({(selectedRole.permissions || []).length} modules).
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setSelectedRole(null)}
              >
                Close
              </Button>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="max-h-[55vh] overflow-y-auto">
                <table className="min-w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50">
                    <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                      <th className="px-4 py-3 font-semibold w-48">Module</th>
                      <th className="px-4 py-3 font-semibold">Permissions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {(selectedRole.permissions || []).map((permission) => (
                      <tr key={`${selectedRole._id || selectedRole.id}-${permission.module}`}>
                        <td className="px-4 py-3 align-top font-medium capitalize text-gray-900">
                          {permission.module}
                        </td>
                        <td className="px-4 py-3">
                          {(permission.actions || []).length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {(permission.actions || []).map((action) => (
                                <span
                                  key={`${permission.module}-${action}`}
                                  className="inline-flex rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700"
                                >
                                  {mapApiActionToUi(action)}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">No actions assigned</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {(selectedRole.permissions || []).length === 0 && (
                      <tr>
                        <td className="px-4 py-4 text-gray-500" colSpan={2}>
                          No module permissions configured for this role.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmationModal
        isOpen={Boolean(confirmDeleteRole)}
        onClose={() => setConfirmDeleteRole(null)}
        onConfirm={async () => {
          if (!confirmDeleteRole) return;
          await handleDelete(confirmDeleteRole.id);
          setConfirmDeleteRole(null);
        }}
        title="Delete Role"
        message={`Are you sure you want to delete ${confirmDeleteRole?.name}?`}
        confirmText="Delete"
        loading={Boolean(confirmDeleteRole && deletingId === confirmDeleteRole.id)}
      />
    </div>
  );
}

export default ListRoles;
