import { useState } from 'react';
import { Button, Form, Input, SupplierSelect } from '../../../components/ui';
import { initialProductForm, PRODUCT_STATUS_OPTIONS } from '../productConfig';

const selectClasses =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

function Field({ label, hint, children, className = '' }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-gray-800">{label}</label>
      {children}
      {hint ? <p className="mt-1.5 text-xs text-gray-500">{hint}</p> : null}
    </div>
  );
}

function ProductForm({
  initialValues = initialProductForm,
  mode = 'create',
  onSubmit,
  submitLabel,
  submittingLabel,
  cancelLabel = 'Cancel',
  onCancel,
}) {
  const [form, setForm] = useState(initialValues);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isCreateMode = mode === 'create';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSupplierChange = (supplierId) => {
    setForm((current) => ({
      ...current,
      supplier: supplierId,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim() || undefined,
      price: Number(form.price),
      quantity: isCreateMode ? Number(form.quantity) : undefined,
      supplier: form.supplier,
      category: form.category.trim(),
      unit: form.unit.trim() || undefined,
      lowStockThreshold: Number(form.lowStockThreshold || 10),
      status: form.status,
    };

    if (!payload.name || !payload.price || !payload.supplier || !payload.category) {
      setError('Name, price, supplier, and category are required.');
      return;
    }

    if (isCreateMode && (Number.isNaN(payload.quantity) || form.quantity === '')) {
      setError('Quantity is required while creating a product.');
      return;
    }

    if (!isCreateMode) {
      delete payload.quantity;
      delete payload.sku;
    }

    setSubmitting(true);

    try {
      await onSubmit(payload);
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Unable to save product';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <section className="rounded-2xl border border-gray-200 bg-gradient-to-br from-slate-50 to-white p-5">
          <div className="mb-5">
            <h3 className="text-base font-semibold text-gray-900">Basic Details</h3>
            <p className="mt-1 text-sm text-gray-500">
              Set the product identity, category, and supplier information.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Product Name">
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter product name"
                className="rounded-lg border-gray-200 px-3 py-2.5 text-sm shadow-sm"
              />
            </Field>

            <Field
              label="SKU"
              hint={isCreateMode ? 'Leave empty to auto-generate one.' : 'SKU cannot be changed after creation.'}
            >
              <Input
                name="sku"
                value={form.sku}
                onChange={handleChange}
                placeholder={isCreateMode ? 'Enter SKU if available' : 'SKU cannot be changed'}
                disabled={!isCreateMode}
                className="rounded-lg border-gray-200 px-3 py-2.5 text-sm shadow-sm disabled:bg-gray-50 disabled:text-gray-500"
              />
            </Field>

            <Field label="Supplier">
              <SupplierSelect
                value={form.supplier}
                onChange={handleSupplierChange}
                placeholder="Search and select supplier..."
              />
            </Field>

            <Field label="Category">
              <Input
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="Enter product category"
                className="rounded-lg border-gray-200 px-3 py-2.5 text-sm shadow-sm"
              />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-5">
            <h3 className="text-base font-semibold text-gray-900">Pricing And Stock</h3>
            <p className="mt-1 text-sm text-gray-500">
              Keep pricing compact and make stock settings easier to scan.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Price" hint="Enter price in rupees.">
              <Input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                placeholder="Enter price"
                className="rounded-lg border-gray-200 px-3 py-2.5 text-sm shadow-sm"
              />
            </Field>

            <Field
              label="Quantity"
              hint={!isCreateMode ? 'Manage quantity from stock adjustment below.' : undefined}
            >
              <Input
                name="quantity"
                type="number"
                min="0"
                value={form.quantity}
                onChange={handleChange}
                placeholder="Enter quantity"
                disabled={!isCreateMode}
                className="rounded-lg border-gray-200 px-3 py-2.5 text-sm shadow-sm disabled:bg-gray-50 disabled:text-gray-500"
              />
            </Field>

            <Field label="Unit">
              <Input
                name="unit"
                value={form.unit}
                onChange={handleChange}
                placeholder="Enter unit of measure"
                className="rounded-lg border-gray-200 px-3 py-2.5 text-sm shadow-sm"
              />
            </Field>

            <Field label="Low Stock Threshold">
              <Input
                name="lowStockThreshold"
                type="number"
                min="0"
                value={form.lowStockThreshold}
                onChange={handleChange}
                placeholder="Enter threshold value"
                className="rounded-lg border-gray-200 px-3 py-2.5 text-sm shadow-sm"
              />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px] md:items-end">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Availability</h3>
              <p className="mt-1 text-sm text-gray-500">
                Choose how this product should appear in the inventory.
              </p>
            </div>

            <Field label="Status" className="md:justify-self-end md:w-full md:max-w-[220px]">
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className={selectClasses}
              >
                {PRODUCT_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </section>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 pt-2">
          <Button
            type="button"
            variant="secondary"
            disabled={submitting}
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? submittingLabel : submitLabel}
          </Button>
        </div>
      </div>
    </Form>
  );
}

export default ProductForm;
