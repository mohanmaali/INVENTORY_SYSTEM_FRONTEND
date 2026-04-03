import { Card } from '../../components/ui';

function AddUser() {
  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Add User</h1>
        <p className="mt-1 text-sm text-gray-600">
          User creation screen for the users module.
        </p>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Create User</h2>
        <p className="text-sm text-gray-500">
          Add user UI can be connected once the create-user API is finalized.
        </p>
      </Card>
    </div>
  );
}

export default AddUser;
