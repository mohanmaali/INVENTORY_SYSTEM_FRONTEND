import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Card } from '../../components/ui';
import RoleForm from './components/RoleForm';
import { createRole } from '../../services/roles';

function AddRole() {
  const navigate = useNavigate();

  const handleSubmit = async (payload) => {
    await createRole(payload);
    toast.success('Role created successfully');
    navigate('/roles');
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Add Role</h1>
        <p className="mt-1 text-sm text-gray-600">
          Create a new role and assign module permissions.
        </p>
      </div>

      <Card className="p-6">
        <div className="flex flex-col gap-1 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">New Role</h2>
          {/* <p className="text-sm text-gray-500">
            This page submits to <code>POST /api/roles</code>.
          </p> */}
        </div>

        <RoleForm
          onSubmit={handleSubmit}
          submitLabel="Create Role"
          submittingLabel="Creating Role..."
          cancelLabel="Back to List"
          onCancel={() => navigate('/roles')}
        />
      </Card>
    </div>
  );
}

export default AddRole;
