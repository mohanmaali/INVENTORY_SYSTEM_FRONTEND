import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Button, Card } from '../../components/ui';
import usePermissions from '../../hooks/usePermissions';
import { createCustomer } from '../../services/customers';
import CustomerForm from './components/CustomerForm';

function AddCustomer() {
  const navigate = useNavigate();
  const permissions = usePermissions('customers');

  const handleSubmit = async (payload) => {
    await createCustomer(payload);
    toast.success('Customer created successfully');
    navigate('/customers');
  };

  if (!permissions.loading && !permissions.canCreate) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">No Access</h2>
        <p className="mt-2 text-sm text-gray-600">You do not have permission to create customers.</p>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Add Customer</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">Create a customer profile for future sales orders and relationship tracking.</p>
        </div>
        <Button type="button" variant="secondary" onClick={() => navigate('/customers')}>
          Back to Customers
        </Button>
      </div>

      <Card className="rounded-3xl border border-gray-200 p-6 shadow-sm">
        <CustomerForm onSubmit={handleSubmit} submitLabel="Create Customer" submittingLabel="Creating Customer..." cancelLabel="Back to Customers" onCancel={() => navigate('/customers')} />
      </Card>
    </div>
  );
}

export default AddCustomer;
