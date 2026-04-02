import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Button, Card } from '../../components/ui';
import usePermissions from '../../hooks/usePermissions';
import { createSupplier } from '../../services/suppliers';
import SupplierForm from './components/SupplierForm';

function AddSupplier() {
  const navigate = useNavigate();
  const permissions = usePermissions('suppliers');

  const handleSubmit = async (payload) => {
    await createSupplier(payload);
    toast.success('Supplier created successfully');
    navigate('/purchase/suppliers');
  };

  if (!permissions.loading && !permissions.canCreate) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">No Access</h2>
        <p className="mt-2 text-sm text-gray-600">
          You do not have permission to create suppliers.
        </p>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Add Supplier</h1>
          <p className="mt-1 text-sm text-gray-600">
            Create a supplier for the purchase module.
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={() => navigate('/purchase/suppliers')}>
          Back to Suppliers
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex flex-col gap-1 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">New Supplier</h2>
          {/* <p className="text-sm text-gray-500">
            This page submits to <code>POST /api/suppliers</code>.
          </p> */}
        </div>

        <SupplierForm
          onSubmit={handleSubmit}
          submitLabel="Create Supplier"
          submittingLabel="Creating Supplier..."
          cancelLabel="Back to Suppliers"
          onCancel={() => navigate('/purchase/suppliers')}
        />
      </Card>
    </div>
  );
}

export default AddSupplier;
