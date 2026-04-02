import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaEdit, FaTrash } from 'react-icons/fa';
import {
  Button,
  Card,
  ConfirmationModal,
  Input,
  Pagination,
} from '../../components/ui';
import usePermissions from '../../hooks/usePermissions';
import { deleteSupplier, getSuppliers } from '../../services/suppliers';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

function ListSuppliers() {
  const navigate = useNavigate();
  const permissions = usePermissions('suppliers');
  const [searchParams, setSearchParams] = useSearchParams();
  const [suppliers, setSuppliers] = useState([]);
  const [meta, setMeta] = useState({
    page: DEFAULT_PAGE,
    limit: DEFAULT_LIMIT,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState('');
  const [confirmDeleteSupplier, setConfirmDeleteSupplier] = useState(null);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  const page = Math.max(Number(searchParams.get('page')) || DEFAULT_PAGE, 1);
  const limit = Math.max(Number(searchParams.get('limit')) || DEFAULT_LIMIT, 1);
  const search = searchParams.get('search') || '';

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    const trimmedValue = searchInput.trim();
    const normalizedSearch = search.trim();

    const timeoutId = setTimeout(() => {
      if (trimmedValue === normalizedSearch) {
        return;
      }

      updateParams({
        page: DEFAULT_PAGE,
        search: trimmedValue || null,
      });
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
      if (value === '' || value === null || value === undefined) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });

    setSearchParams(next);
  };

  const loadSuppliers = async () => {
    setLoading(true);

    try {
      const res = await getSuppliers({
        page,
        limit,
        search: search || undefined,
      });

      setSuppliers(Array.isArray(res?.data) ? res.data : []);
      setMeta({
        page: res?.meta?.page || page,
        limit: res?.meta?.limit || limit,
        total: res?.meta?.total || 0,
      });
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to load suppliers';
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

    loadSuppliers();
  }, [page, limit, search, permissions.loading, permissions.canRead]);

  const handleDelete = async (id) => {
    setDeletingId(id);

    try {
      await deleteSupplier(id);
      toast.success('Supplier deleted successfully');

      const shouldGoBack = suppliers.length === 1 && page > 1;
      if (shouldGoBack) {
        updateParams({ page: page - 1 });
      } else {
        await loadSuppliers();
      }
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to delete supplier';
      toast.error(message);
    } finally {
      setDeletingId('');
    }
  };

  if (!permissions.loading && !permissions.canRead) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">No Access</h2>
        <p className="mt-2 text-sm text-gray-600">
          You do not have permission to view suppliers.
        </p>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Suppliers</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage suppliers with pagination and live search.
          </p>
        </div>
        {permissions.canCreate && (
          <Button type="button" onClick={() => navigate('/purchase/suppliers/add')}>
            Add Supplier
          </Button>
        )}
      </div>

      <Card className="p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-[240px]">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Search
              </label>
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by supplier name or contact"
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setSearchInput('');
                updateParams({
                  page: DEFAULT_PAGE,
                  search: null,
                });
              }}
            >
              Clear
            </Button>
          </div>

          <div className="flex items-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={loadSuppliers}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading suppliers...</p>
        ) : suppliers.length === 0 ? (
          <p className="text-sm text-gray-500">No suppliers found.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Contact</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Address</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {suppliers.map((supplier) => {
                  const supplierId = supplier._id || supplier.id;

                  return (
                    <tr key={supplierId} className="hover:bg-gray-50">
                      <td className="px-4 py-4 font-medium text-gray-900">
                        {supplier.name}
                      </td>
                      <td className="px-4 py-4 text-gray-600">
                        {supplier.contact}
                      </td>
                      <td className="px-4 py-4 text-gray-600">
                        {supplier.email}
                      </td>
                      <td className="px-4 py-4 text-gray-600">
                        {supplier.address}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          {permissions.canUpdate && (
                            <Button
                              type="button"
                              variant="secondary"
                              className="inline-flex items-center gap-2 px-3 py-1.5"
                              onClick={() =>
                                navigate(
                                  `/purchase/suppliers/${supplierId}/edit?page=${page}&limit=${limit}${
                                    search ? `&search=${encodeURIComponent(search)}` : ''
                                  }`
                                )
                              }
                              disabled={deletingId === supplierId}
                            >
                              <FaEdit className="h-3.5 w-3.5" />
                              Edit
                            </Button>
                          )}
                          {permissions.canDelete && (
                            <Button
                              type="button"
                              variant="ghost"
                              className="inline-flex items-center gap-2 px-3 py-1.5"
                              onClick={() =>
                                setConfirmDeleteSupplier({
                                  id: supplierId,
                                  name: supplier.name || 'this supplier',
                                })
                              }
                              disabled={deletingId === supplierId}
                            >
                              <FaTrash className="h-3.5 w-3.5" />
                              {deletingId === supplierId ? 'Deleting...' : 'Delete'}
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

        <Pagination
          className="mt-6"
          page={page}
          totalPages={totalPages}
          totalItems={meta.total}
          loading={loading}
          perPage={limit}
          onPerPageChange={(nextLimit) =>
            updateParams({
              page: DEFAULT_PAGE,
              limit: nextLimit,
            })
          }
          onPageChange={(nextPage) => updateParams({ page: nextPage })}
        />
      </Card>

      <ConfirmationModal
        isOpen={Boolean(confirmDeleteSupplier)}
        onClose={() => setConfirmDeleteSupplier(null)}
        onConfirm={async () => {
          if (!confirmDeleteSupplier) return;
          await handleDelete(confirmDeleteSupplier.id);
          setConfirmDeleteSupplier(null);
        }}
        title="Delete Supplier"
        message={`Are you sure you want to delete ${confirmDeleteSupplier?.name}?`}
        confirmText="Delete"
        loading={Boolean(
          confirmDeleteSupplier && deletingId === confirmDeleteSupplier.id
        )}
      />
    </div>
  );
}

export default ListSuppliers;
