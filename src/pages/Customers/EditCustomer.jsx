import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Button, Card } from '../../components/ui';
import usePermissions from '../../hooks/usePermissions';
import { getCustomerById, updateCustomer } from '../../services/customers';
import { initialCustomerForm } from './customerConfig';
import CustomerForm from './components/CustomerForm';

function EditCustomer() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const permissions = usePermissions('customers');
  const [loading, setLoading] = useState(true);
  const [formValues, setFormValues] = useState(initialCustomerForm);

  const backTarget = `/customers?page=${searchParams.get('page') || '1'}&limit=${searchParams.get('limit') || '10'}${searchParams.get('search') ? `&search=${encodeURIComponent(searchParams.get('search'))}` : ''}${searchParams.get('type') ? `&type=${encodeURIComponent(searchParams.get('type'))}` : ''}${searchParams.get('status') ? `&status=${encodeURIComponent(searchParams.get('status'))}` : ''}`;

  useEffect(() => {
    if (permissions.loading) return;
    if (!permissions.canRead && !permissions.canUpdate) {
      setLoading(false);
      return;
    }

    const loadCustomer = async () => {
      setLoading(true);
      try {
        const customer = await getCustomerById(id);
        setFormValues({
          name: customer.name || '',
          type: customer.type || 'individual',
          email: customer.email || '',
          phone: customer.phone || '',
          companyName: customer.companyName || '',
          taxId: customer.taxId || '',
          creditLimit: customer.creditLimit ?? '',
          status: customer.status || 'active',
          notes: customer.notes || '',
          address: {
            street: customer.address?.street || '',
            city: customer.address?.city || '',
            state: customer.address?.state || '',
            zipCode: customer.address?.zipCode || '',
            country: customer.address?.country || '',
          },
        });
      } catch (err) {
        const message = err.response?.data?.message || err.message || 'Failed to load customer details';
        toast.error(message);
        navigate('/customers');
      } finally {
        setLoading(false);
      }
    };

    loadCustomer();
  }, [id, navigate, permissions.loading, permissions.canRead, permissions.canUpdate]);

  const handleSubmit = async (payload) => {
    await updateCustomer(id, payload);
    toast.success('Customer updated successfully');
    navigate(backTarget);
  };

  if (!permissions.loading && !permissions.canUpdate) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">No Access</h2>
        <p className="mt-2 text-sm text-gray-600">You do not have permission to update customers.</p>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Update Customer</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">Update customer profile details, account settings, and notes.</p>
        </div>
        <Button type="button" variant="secondary" onClick={() => navigate(backTarget)}>
          Back to Customers
        </Button>
      </div>

      <Card className="rounded-3xl border border-gray-200 p-6 shadow-sm">
        {loading ? (
          <p className="text-sm text-gray-500">Loading customer details...</p>
        ) : (
          <CustomerForm initialValues={formValues} onSubmit={handleSubmit} submitLabel="Update Customer" submittingLabel="Updating Customer..." cancelLabel="Back to Customers" onCancel={() => navigate(backTarget)} />
        )}
      </Card>
    </div>
  );
}

export default EditCustomer;
