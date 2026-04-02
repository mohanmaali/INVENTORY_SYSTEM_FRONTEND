import { useMemo, useState } from 'react';
import { Button, Form, Input } from '../../../components/ui';
import {
  AVAILABLE_ACTIONS,
  initialRoleForm,
  MODULES,
  mapUiActionToApi,
} from '../roleConfig';

function RoleForm({
  initialValues = initialRoleForm,
  onSubmit,
  submitLabel,
  submittingLabel,
  cancelLabel = 'Cancel',
  onCancel,
}) {
  const [form, setForm] = useState(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = useMemo(() => {
    return (
      form.name.trim() &&
      form.permissions.length > 0 &&
      form.permissions.every(
        (permission) => permission.module.trim() && permission.actions.length > 0
      )
    );
  }, [form]);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const toggleModule = (module) => {
    setForm((current) => ({
      ...current,
      permissions: current.permissions.some((permission) => permission.module === module)
        ? current.permissions.filter((permission) => permission.module !== module)
        : [...current.permissions, { module, actions: [] }],
    }));
  };

  const toggleAction = (module, action) => {
    setForm((current) => ({
      ...current,
      permissions: current.permissions.map((permission) => {
        if (permission.module !== module) {
          return permission;
        }

        const hasAction = permission.actions.includes(action);
        return {
          ...permission,
          actions: hasAction
            ? permission.actions.filter((item) => item !== action)
            : [...permission.actions, action],
        };
      }),
    }));
  };

  const handleReset = () => {
    setForm(initialValues);
    setError('');
    if (onCancel) {
      onCancel();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      permissions: form.permissions.map((permission) => ({
        module: permission.module.trim(),
        actions: permission.actions.map(mapUiActionToApi),
      })),
    };

    if (!payload.name) {
      setError('Role name is required.');
      return;
    }

    const invalidPermission = payload.permissions.find(
      (permission) => !permission.module || permission.actions.length === 0
    );

    if (invalidPermission) {
      setError('Each selected module needs at least one action.');
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit(payload);
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Unable to save role';
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
            Role Name
          </label>
          <Input
            name="name"
            value={form.name}
            onChange={handleFieldChange}
            placeholder="e.g. Store Manager"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleFieldChange}
            rows={1}
            placeholder="Optional description for this role"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Permissions</h3>
          <p className="text-sm text-gray-500">
            Select modules and choose allowed actions for each selected module.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {MODULES.map((module) => {
            const selectedPermission = form.permissions.find(
              (permission) => permission.module === module
            );
            const isSelected = Boolean(selectedPermission);

            return (
              <div
                key={module}
                className={`rounded-lg border p-4 transition-colors ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleModule(module)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm font-semibold capitalize text-gray-900">
                    {module}
                  </span>
                </label>

                {isSelected && (
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <span className="block text-sm font-medium text-gray-700 mb-2">
                      Actions
                    </span>
                    <div className="flex flex-wrap gap-3">
                      {AVAILABLE_ACTIONS.map((action) => {
                        const checked = selectedPermission.actions.includes(action);

                        return (
                          <label
                            key={`${module}-${action}`}
                            className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                              checked
                                ? 'border-primary bg-primary/10 text-primary-700'
                                : 'border-gray-200 bg-white text-gray-700'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleAction(module, action)}
                              className="h-4 w-4"
                            />
                            <span className="capitalize">{action}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" disabled={submitting || !canSubmit}>
          {submitting ? submittingLabel : submitLabel}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={submitting}
          onClick={handleReset}
        >
          {cancelLabel}
        </Button>
      </div>
    </Form>
  );
}

export default RoleForm;
