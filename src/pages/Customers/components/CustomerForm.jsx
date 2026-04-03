import { useState } from 'react';
import { Button, Form, Input } from '../../../components/ui';
import {
  customerInputClasses,
  CUSTOMER_STATUS_OPTIONS,
  CUSTOMER_TYPES,
  initialCustomerForm,
} from '../customerConfig';

function CustomerForm({
  initialValues = initialCustomerForm,
  onSubmit,
  submitLabel,
  submittingLabel,
  cancelLabel = 'Cancel',
  onCancel,
}) {
  const [form, setForm] = useState(initialValues);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleAddressChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      address: {
        ...current.address,
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const payload = {
      name: form.name.trim(),
      type: form.type,
      email: form.email.trim() || undefined,
      phone: form.phone.trim(),
      companyName: form.companyName.trim() || undefined,
      taxId: form.taxId.trim() || undefined,
      creditLimit: form.creditLimit === '' ? undefined : Number(form.creditLimit),
      status: form.status,
      notes: form.notes.trim() || undefined,
      address: Object.values(form.address || {}).some(Boolean)
        ? {
            street: form.address.street.trim() || undefined,
            city: form.address.city.trim() || undefined,
            state: form.address.state.trim() || undefined,
            zipCode: form.address.zipCode.trim() || undefined,
            country: form.address.country.trim() || undefined,
          }
        : undefined,
    };

    if (!payload.name || !payload.type || !payload.phone) {
      setError('Name, type, and phone are required.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(payload);
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Unable to save customer';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <section className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-5">
            <h3 className="text-base font-semibold text-gray-900">Basic Details</h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-800">Customer Name</label>
              <Input name="name" value={form.name} onChange={handleChange} placeholder="Enter customer name" className="rounded-lg border-gray-200 px-3 py-2.5 text-sm shadow-sm" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-800">Customer Type</label>
              <select name="type" value={form.type} onChange={handleChange} className={customerInputClasses}>
                {CUSTOMER_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-800">Phone</label>
              <Input name="phone" value={form.phone} onChange={handleChange} placeholder="Enter phone number" className="rounded-lg border-gray-200 px-3 py-2.5 text-sm shadow-sm" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-800">Email</label>
              <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Enter email address" className="rounded-lg border-gray-200 px-3 py-2.5 text-sm shadow-sm" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-800">Company Name</label>
              <Input name="companyName" value={form.companyName} onChange={handleChange} placeholder="Enter company name" className="rounded-lg border-gray-200 px-3 py-2.5 text-sm shadow-sm" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-800">Tax ID</label>
              <Input name="taxId" value={form.taxId} onChange={handleChange} placeholder="Enter tax ID" className="rounded-lg border-gray-200 px-3 py-2.5 text-sm shadow-sm" />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-5">
            <h3 className="text-base font-semibold text-gray-900">Account Details</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-800">Credit Limit</label>
              <Input name="creditLimit" type="number" min="0" value={form.creditLimit} onChange={handleChange} placeholder="Enter credit limit" className="rounded-lg border-gray-200 px-3 py-2.5 text-sm shadow-sm" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-800">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className={customerInputClasses}>
                {CUSTOMER_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-800">Notes</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={4} className={`${customerInputClasses} resize-none`} placeholder="Add customer notes" />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-5">
            <h3 className="text-base font-semibold text-gray-900">Address</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-800">Street</label>
              <Input name="street" value={form.address?.street || ''} onChange={handleAddressChange} placeholder="Enter street" className="rounded-lg border-gray-200 px-3 py-2.5 text-sm shadow-sm" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-800">City</label>
              <Input name="city" value={form.address?.city || ''} onChange={handleAddressChange} placeholder="Enter city" className="rounded-lg border-gray-200 px-3 py-2.5 text-sm shadow-sm" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-800">State</label>
              <Input name="state" value={form.address?.state || ''} onChange={handleAddressChange} placeholder="Enter state" className="rounded-lg border-gray-200 px-3 py-2.5 text-sm shadow-sm" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-800">Zip Code</label>
              <Input name="zipCode" value={form.address?.zipCode || ''} onChange={handleAddressChange} placeholder="Enter zip code" className="rounded-lg border-gray-200 px-3 py-2.5 text-sm shadow-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-800">Country</label>
              <Input name="country" value={form.address?.country || ''} onChange={handleAddressChange} placeholder="Enter country" className="rounded-lg border-gray-200 px-3 py-2.5 text-sm shadow-sm" />
            </div>
          </div>
        </section>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 pt-2">
          <Button type="button" variant="secondary" disabled={submitting} onClick={onCancel}>
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

export default CustomerForm;
