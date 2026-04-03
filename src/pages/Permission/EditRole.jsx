import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Card } from '../../components/ui';
import RoleForm from './components/RoleForm';
import { getRoleById, updateRole } from '../../services/roles';
import { initialRoleForm, mapApiActionToUi } from './roleConfig';
import usePermissions from '../../hooks/usePermissions';

function EditRole() {
  const permissions = usePermissions('roles');
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [formValues, setFormValues] = useState(initialRoleForm);

  useEffect(() => {
    const loadRole = async () => {
      setLoading(true);

      try {
        const role = await getRoleById(id);
        setFormValues({
          name: role.name || '',
          description: role.description || '',
          permissions: Array.isArray(role.permissions)
            ? role.permissions.map((permission) => ({
                module: permission.module,
                actions: Array.isArray(permission.actions)
                  ? permission.actions.map(mapApiActionToUi)
                  : [],
              }))
            : [],
        });
      } catch (err) {
        const message =
          err.response?.data?.message || err.message || 'Failed to load role details';
        toast.error(message);
        navigate('/roles');
      } finally {
        setLoading(false);
      }
    };

    loadRole();
  }, [id, navigate]);

  const handleSubmit = async (payload) => {
    await updateRole(id, payload);
    toast.success('Role updated successfully');
    navigate('/roles');
  };

  return (
    <div className="w-full space-y-6">
      {!permissions.loading && !permissions.canRead ? (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900">No Access</h2>
          <p className="mt-2 text-sm text-gray-600">
            You do not have permission to view this role.
          </p>
        </Card>
      ) : (
        <>
          <div>
            <h1 className="text-2xl font-semibold">Update Role</h1>
            <p className="mt-1 text-sm text-gray-600">
              Edit role details and assigned permissions.
            </p>
          </div>

          <Card className="p-6">
            <div className="flex flex-col gap-1 mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Edit Role</h2>
              {/* <p className="text-sm text-gray-500">
                This page updates a role with <code>PATCH /api/roles/:id</code>.
              </p> */}
            </div>

            {loading ? (
              <p className="text-sm text-gray-500">Loading role details...</p>
            ) : (
              <RoleForm
                initialValues={formValues}
                onSubmit={handleSubmit}
                submitLabel="Update Role"
                submittingLabel="Updating Role..."
                cancelLabel="Back to List"
                onCancel={() => navigate('/roles')}
              />
            )}
          </Card>
        </>
      )}
    </div>
  );
}

export default EditRole;
