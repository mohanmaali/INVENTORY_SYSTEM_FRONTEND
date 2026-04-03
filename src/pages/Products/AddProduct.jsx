import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Button, Card } from '../../components/ui';
import usePermissions from '../../hooks/usePermissions';
import { createProduct } from '../../services/products';
import ProductForm from './components/ProductForm';

function AddProduct() {
  const navigate = useNavigate();
  const permissions = usePermissions("products");

  const handleSubmit = async (payload) => {
    await createProduct(payload);
    toast.success('Product created successfully');
    navigate('/inventory');
  };

  if (!permissions.loading && !permissions.canCreate) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">No Access</h2>
        <p className="mt-2 text-sm text-gray-600">
          You do not have permission to create products.
        </p>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Add Product</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            Create a product and assign its supplier and stock values.
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={() => navigate('/inventory')}>
          Back to Products
        </Button>
      </div>

      <Card className="overflow-hidden rounded-3xl border border-gray-200 p-0 shadow-sm">
        <div className="border-b border-gray-100 bg-gradient-to-r from-amber-50 via-white to-slate-50 px-6 py-5">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-gray-900">New Product</h2>
            <p className="text-sm text-gray-500">
              Add pricing, supplier details, and opening stock in one place.
            </p>
          </div>
        </div>

        <div className="p-6">
          <ProductForm
            mode="create"
            onSubmit={handleSubmit}
            submitLabel="Create Product"
            submittingLabel="Creating Product..."
            cancelLabel="Back to Products"
            onCancel={() => navigate('/inventory')}
          />
        </div>
      </Card>
    </div>
  );
}

export default AddProduct;
