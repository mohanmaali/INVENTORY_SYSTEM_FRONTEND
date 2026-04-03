import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Button, Card } from '../../components/ui';
import usePermissions from '../../hooks/usePermissions';
import { getSupplierById, updateSupplier } from '../../services/suppliers';
import SupplierForm from './components/SupplierForm';

function EditSupplier() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const permissions = usePermissions('suppliers');
  const [loading, setLoading] = useState(true);
  const [formValues, setFormValues] = useState({
    name: '',
    contact: '',
    email: '',
    address: '',
  });

  const backTarget = `/purchase/suppliers?page=${searchParams.get('page') || '1'}&limit=${
    searchParams.get('limit') || '10'
  }${searchParams.get('search') ? `&search=${encodeURIComponent(searchParams.get('search'))}` : ''}`;

  useEffect(() => {
    if (permissions.loading) {
      return;
    }

    if (!permissions.canRead && !permissions.canUpdate) {
      setLoading(false);
      return;
    }

    const loadSupplier = async () => {
      setLoading(true);

      try {
        const supplier = await getSupplierById(id);
        setFormValues({
          name: supplier.name || '',
          contact: supplier.contact || '',
          email: supplier.email || '',
          address: supplier.address || '',
        });
      } catch (err) {
        const message =
          err.response?.data?.message || err.message || 'Failed to load supplier details';
        toast.error(message);
        navigate('/purchase/suppliers');
      } finally {
        setLoading(false);
      }
    };

    loadSupplier();
  }, [id, navigate, permissions.loading, permissions.canRead, permissions.canUpdate]);

  const handleSubmit = async (payload) => {
    await updateSupplier(id, payload);
    toast.success('Supplier updated successfully');
    navigate(backTarget);
  };

  if (!permissions.loading && !permissions.canUpdate) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">No Access</h2>
        <p className="mt-2 text-sm text-gray-600">
          You do not have permission to update suppliers.
        </p>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Update Supplier</h1>
          <p className="mt-1 text-sm text-gray-600">
            Edit supplier details for the purchase module.
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={() => navigate(backTarget)}>
          Back to Suppliers
        </Button>
      </div>

      <Card className="p-6">
        {loading ? (
          <p className="text-sm text-gray-500">Loading supplier details...</p>
        ) : (
          <>
            <div className="flex flex-col gap-1 mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Edit Supplier</h2>
              <p className="text-sm text-gray-500">
                Update supplier information used across purchase workflows.
              </p>
            </div>

            <SupplierForm
              initialValues={formValues}
              onSubmit={handleSubmit}
              submitLabel="Update Supplier"
              submittingLabel="Updating Supplier..."
              cancelLabel="Back to Suppliers"
              onCancel={() => navigate(backTarget)}
            />
          </>
        )}
      </Card>
    </div>
  );
}

export default EditSupplier;
