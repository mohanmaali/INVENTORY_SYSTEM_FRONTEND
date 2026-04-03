import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaEdit, FaEye, FaTrash } from 'react-icons/fa';
import { Button, Card, ConfirmationModal, Input, Pagination } from '../../components/ui';
import usePermissions from '../../hooks/usePermissions';
import {
  deleteCustomer,
  getCustomers,
  permanentlyDeleteCustomer,
} from '../../services/customers';
import {
  CUSTOMER_STATUS_OPTIONS,
  CUSTOMER_TYPES,
  customerInputClasses,
  getCustomerAddressText,
  getCustomerStatusClassName,
} from './customerConfig';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

function ListCustomers() {
  const navigate = useNavigate();
  const permissions = usePermissions('customers');
  const [searchParams, setSearchParams] = useSearchParams();
  const [customers, setCustomers] = useState([]);
  const [meta, setMeta] = useState({ page: DEFAULT_PAGE, limit: DEFAULT_LIMIT, total: 0 });
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState('');
  const [permanentDeletingId, setPermanentDeletingId] = useState('');
  const [confirmDeactivateCustomer, setConfirmDeactivateCustomer] = useState(null);
  const [confirmPermanentDeleteCustomer, setConfirmPermanentDeleteCustomer] = useState(null);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  const page = Math.max(Number(searchParams.get('page')) || DEFAULT_PAGE, 1);
  const limit = Math.max(Number(searchParams.get('limit')) || DEFAULT_LIMIT, 1);
  const search = searchParams.get('search') || '';
  const type = searchParams.get('type') || '';
  const status = searchParams.get('status') || '';

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    const trimmedValue = searchInput.trim();
    const normalizedSearch = search.trim();

    const timeoutId = setTimeout(() => {
      if (trimmedValue === normalizedSearch) return;
      updateParams({ page: DEFAULT_PAGE, search: trimmedValue || null });
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const totalPages = useMemo(() => {
    const total = Number(meta.total) || 0;
    const currentLimit = Number(meta.limit) || limit;
    return Math.max(1, Math.ceil(total / currentLimit));
  }, [meta.total, meta.limit, limit]);

  const updateParams = (nextValues) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(nextValues).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) next.delete(key);
      else next.set(key, String(value));
    });
    setSearchParams(next);
  };

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await getCustomers({
        page,
        limit,
        search: search || undefined,
        type: type || undefined,
        status: status || undefined,
      });
      setCustomers(Array.isArray(res?.data) ? res.data : []);
      setMeta({
        page: res?.meta?.page || page,
        limit: res?.meta?.limit || limit,
        total: res?.meta?.total || 0,
      });
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to load customers';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (permissions.loading || !permissions.canRead) {
      setLoading(false);
      return;
    }
    loadCustomers();
  }, [page, limit, search, type, status, permissions.loading, permissions.canRead]);

  const handleDeactivate = async (id) => {
    setDeletingId(id);
    try {
      await deleteCustomer(id);
      toast.success('Customer set to inactive successfully');
      const shouldGoBack = customers.length === 1 && page > 1;
      if (shouldGoBack) updateParams({ page: page - 1 });
      else await loadCustomers();
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to deactivate customer';
      toast.error(message);
    } finally {
      setDeletingId('');
    }
  };

  const handlePermanentDelete = async (id) => {
    setPermanentDeletingId(id);
    try {
      await permanentlyDeleteCustomer(id);
      toast.success('Customer deleted permanently');
      const shouldGoBack = customers.length === 1 && page > 1;
      if (shouldGoBack) updateParams({ page: page - 1 });
      else await loadCustomers();
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to delete customer';
      toast.error(message);
    } finally {
      setPermanentDeletingId('');
    }
  };

  if (!permissions.loading && !permissions.canRead) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">No Access</h2>
        <p className="mt-2 text-sm text-gray-600">You do not have permission to view customers.</p>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Customers</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            Manage customer profiles, status, and order relationships.
          </p>
        </div>
        {permissions.canCreate && (
          <Button type="button" onClick={() => navigate('/customers/add')}>
            Add Customer
          </Button>
        )}
      </div>

      <Card className="rounded-3xl border border-gray-200 p-6 shadow-sm">
        <div className="mb-6 grid gap-4 lg:grid-cols-4 xl:grid-cols-5">
          <div className="xl:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Search</label>
            <Input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search by name, phone, email, or code" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Type</label>
            <select value={type} onChange={(event) => updateParams({ page: DEFAULT_PAGE, type: event.target.value || null })} className={customerInputClasses}>
              <option value="">All types</option>
              {CUSTOMER_TYPES.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Status</label>
            <select value={status} onChange={(event) => updateParams({ page: DEFAULT_PAGE, status: event.target.value || null })} className={customerInputClasses}>
              <option value="">All statuses</option>
              {CUSTOMER_STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button type="button" variant="secondary" className="w-full" onClick={() => { setSearchInput(''); setSearchParams(new URLSearchParams()); }}>
              Clear Filters
            </Button>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading customers...</p>
        ) : customers.length === 0 ? (
          <p className="text-sm text-gray-500">No customers found.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Mobile</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Address</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {customers.map((customer) => {
                  const customerId = customer._id || customer.id;
                  return (
                    <tr key={customerId} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900">{customer.name}</div>
                        <div className="text-xs text-gray-500">{customer.customerCode || 'No code'}</div>
                      </td>
                      <td className="px-4 py-4 text-gray-600">{customer.phone || 'No phone'}</td>
                      <td className="px-4 py-4 text-gray-600">{customer.email || 'No email'}</td>
                      <td className="px-4 py-4 text-gray-600">{getCustomerAddressText(customer.address)}</td>
                      <td className="px-4 py-4 text-gray-600 capitalize">{customer.type}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-md px-3 py-1 capitalize ${getCustomerStatusClassName(customer.status)}`}>
                          {customer.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="secondary" className="inline-flex items-center gap-2 px-3 py-1.5" onClick={() => navigate(`/customers/${customerId}`)}>
                            <FaEye className="h-3.5 w-3.5" />
                            View
                          </Button>
                          {permissions.canUpdate && (
                            <Button type="button" variant="secondary" className="inline-flex items-center gap-2 px-3 py-1.5" onClick={() => navigate(`/customers/${customerId}/edit?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ''}${type ? `&type=${encodeURIComponent(type)}` : ''}${status ? `&status=${encodeURIComponent(status)}` : ''}`)}>
                              <FaEdit className="h-3.5 w-3.5" />
                              Edit
                            </Button>
                          )}
                          {permissions.canDelete && (
                            <Button type="button" variant="ghost" className="inline-flex items-center gap-2 px-3 py-1.5" onClick={() => setConfirmDeactivateCustomer({ id: customerId, name: customer.name || 'this customer' })} disabled={deletingId === customerId}>
                              <FaTrash className="h-3.5 w-3.5" />
                              {deletingId === customerId ? 'Updating...' : 'Deactivate'}
                            </Button>
                          )}
                          {permissions.canDelete && (
                            <Button type="button" variant="ghost" className="inline-flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50" onClick={() => setConfirmPermanentDeleteCustomer({ id: customerId, name: customer.name || 'this customer' })} disabled={permanentDeletingId === customerId}>
                              {permanentDeletingId === customerId ? 'Deleting...' : 'Delete'}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination className="mt-6" page={page} totalPages={totalPages} totalItems={meta.total} loading={loading} perPage={limit} onPerPageChange={(nextLimit) => updateParams({ page: DEFAULT_PAGE, limit: nextLimit })} onPageChange={(nextPage) => updateParams({ page: nextPage })} />
      </Card>

      <ConfirmationModal
        isOpen={Boolean(confirmDeactivateCustomer)}
        onClose={() => setConfirmDeactivateCustomer(null)}
        onConfirm={async () => {
          if (!confirmDeactivateCustomer) return;
          await handleDeactivate(confirmDeactivateCustomer.id);
          setConfirmDeactivateCustomer(null);
        }}
        title="Deactivate Customer"
        message={`Are you sure you want to deactivate ${confirmDeactivateCustomer?.name}?`}
        confirmText="Deactivate"
        loading={Boolean(confirmDeactivateCustomer && deletingId === confirmDeactivateCustomer.id)}
      />

      <ConfirmationModal
        isOpen={Boolean(confirmPermanentDeleteCustomer)}
        onClose={() => setConfirmPermanentDeleteCustomer(null)}
        onConfirm={async () => {
          if (!confirmPermanentDeleteCustomer) return;
          await handlePermanentDelete(confirmPermanentDeleteCustomer.id);
          setConfirmPermanentDeleteCustomer(null);
        }}
        title="Delete Customer Permanently"
        message={`Are you sure you want to permanently delete ${confirmPermanentDeleteCustomer?.name}? This cannot be undone.`}
        confirmText="Delete Permanently"
        loading={Boolean(confirmPermanentDeleteCustomer && permanentDeletingId === confirmPermanentDeleteCustomer.id)}
      />
    </div>
  );
}

export default ListCustomers;
