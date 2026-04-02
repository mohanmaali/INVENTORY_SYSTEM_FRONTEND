import { useState } from 'react';
import { Button, Form, Input } from '../../../components/ui';

const initialSupplierForm = {
  name: '',
  contact: '',
  email: '',
  address: '',
};

function SupplierForm({
  initialValues = initialSupplierForm,
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const payload = {
      name: form.name.trim(),
      contact: form.contact.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
    };

    if (!payload.name || !payload.contact || !payload.email || !payload.address) {
      setError('All supplier fields are required.');
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit(payload);
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Unable to save supplier';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Supplier Name
          </label>
          <Input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Global Traders"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact
          </label>
          <Input
            name="contact"
            value={form.contact}
            onChange={handleChange}
            placeholder="+91 9876543210"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <Input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="supplier@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <Input
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="123 Market Road, Pune"
          />
        </div>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? submittingLabel : submitLabel}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={submitting}
          onClick={onCancel}
        >
          {cancelLabel}
        </Button>
      </div>
    </Form>
  );
}

export default SupplierForm;
