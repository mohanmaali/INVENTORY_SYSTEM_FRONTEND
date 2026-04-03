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
import { deleteProduct, getProducts } from '../../services/products';
import { getSuppliers } from '../../services/suppliers';
import {
  formatCurrency,
  getProductStatusClassName,
  PRODUCT_STATUS_OPTIONS,
} from './productConfig';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const filterSelectClasses =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary';

function ListProducts() {
  const navigate = useNavigate();
  const permissions = usePermissions('products');
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [meta, setMeta] = useState({
    page: DEFAULT_PAGE,
    limit: DEFAULT_LIMIT,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState('');
  const [confirmDeleteProduct, setConfirmDeleteProduct] = useState(null);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  const page = Math.max(Number(searchParams.get('page')) || DEFAULT_PAGE, 1);
  const limit = Math.max(Number(searchParams.get('limit')) || DEFAULT_LIMIT, 1);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const category = searchParams.get('category') || '';
  const supplier = searchParams.get('supplier') || '';

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
    try {
      const res = await getSuppliers({ page: 1, limit: 100 });
      setSuppliers(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to load suppliers';
      toast.error(message);
    }
  };

  const loadProducts = async () => {
    setLoading(true);

    try {
      const res = await getProducts({
        page,
        limit,
        search: search || undefined,
        status: status || undefined,
        category: category || undefined,
        supplier: supplier || undefined,
      });

      setProducts(Array.isArray(res?.data) ? res.data : []);
      setMeta({
        page: res?.meta?.page || page,
        limit: res?.meta?.limit || limit,
        total: res?.meta?.total || 0,
      });
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to load products';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  useEffect(() => {
    if (permissions.loading || !permissions.canRead) {
      setLoading(false);
      return;
    }

    loadProducts();
  }, [page, limit, search, status, category, supplier, permissions.loading, permissions.canRead]);

  const handleDelete = async (id) => {
    setDeletingId(id);

    try {
      await deleteProduct(id);
      toast.success('Product deleted permanently');

      const shouldGoBack = products.length === 1 && page > 1;
      if (shouldGoBack) {
        updateParams({ page: page - 1 });
      } else {
        await loadProducts();
      }
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to delete product';
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
          You do not have permission to view products.
        </p>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage products, suppliers, filters, and stock visibility.
          </p>
        </div>
        {permissions.canCreate && (
          <Button type="button" onClick={() => navigate('/inventory/add')}>
            Add Product
          </Button>
        )}
      </div>

      <Card className="p-6">
        <div className="mb-6 grid gap-4 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Search
            </label>
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by product name or SKU"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              value={status}
              onChange={(event) =>
                updateParams({ page: DEFAULT_PAGE, status: event.target.value || null })
              }
              className={filterSelectClasses}
            >
              <option value="">All statuses</option>
              {PRODUCT_STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Supplier
            </label>
            <select
              value={supplier}
              onChange={(event) =>
                updateParams({ page: DEFAULT_PAGE, supplier: event.target.value || null })
              }
              className={filterSelectClasses}
            >
              <option value="">All suppliers</option>
              {suppliers.map((supplierItem) => {
                const supplierId = supplierItem._id || supplierItem.id;
                return (
                  <option key={supplierId} value={supplierId}>
                    {supplierItem.name}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Category
            </label>
            <Input
              value={category}
              onChange={(event) =>
                updateParams({ page: DEFAULT_PAGE, category: event.target.value || null })
              }
              placeholder="Filter category"
            />
          </div>
        </div>

        <div className="mb-6 flex justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setSearchInput('');
              setSearchParams(new URLSearchParams());
            }}
          >
            Clear Filters
          </Button>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-sm text-gray-500">No products found.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">SKU</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Supplier</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Stock</th>
                  <th className="px-4 py-3 font-semibold">Low Stock Threshold</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {products.map((product) => {
                  const productId = product._id || product.id;

                  return (
                    <tr key={productId} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900">{product.name}</div>
                      </td>
                      <td className="px-4 py-4 text-gray-600">{product.sku}</td>
                      <td className="px-4 py-4 text-gray-600">{product.category || '-'}</td>
                      <td className="px-4 py-4 text-gray-600">
                        {product.supplier?.name || 'No supplier'}
                      </td>
                      <td className="px-4 py-4 text-gray-600">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="text-gray-700">
                            {product.quantity} {product.unit || 'pcs'}
                          </span>
                          {product.isLowStock && (
                            <span className="text-xs font-medium text-red-600">
                              Low stock
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-600">
                        {product.lowStockThreshold ?? '-'}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-md px-3 py-1 capitalize ${getProductStatusClassName(
                            product.status
                          )}`}
                        >
                          {product.status}
                        </span>
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
                                  `/inventory/${productId}/edit?page=${page}&limit=${limit}${
                                    search ? `&search=${encodeURIComponent(search)}` : ''
                                  }${status ? `&status=${encodeURIComponent(status)}` : ''}${
                                    category ? `&category=${encodeURIComponent(category)}` : ''
                                  }${supplier ? `&supplier=${encodeURIComponent(supplier)}` : ''}`
                                )
                              }
                              disabled={deletingId === productId}
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
                                setConfirmDeleteProduct({
                                  id: productId,
                                  name: product.name || 'this product',
                                })
                              }
                              disabled={deletingId === productId}
                            >
                              <FaTrash className="h-3.5 w-3.5" />
                              {deletingId === productId ? 'Deleting...' : 'Delete'}
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
        isOpen={Boolean(confirmDeleteProduct)}
        onClose={() => setConfirmDeleteProduct(null)}
        onConfirm={async () => {
          if (!confirmDeleteProduct) return;
          await handleDelete(confirmDeleteProduct.id);
          setConfirmDeleteProduct(null);
        }}
        title="Delete Product"
        message={`Are you sure you want to permanently delete ${confirmDeleteProduct?.name}? This will also remove stock logs.`}
        confirmText="Delete"
        loading={Boolean(confirmDeleteProduct && deletingId === confirmDeleteProduct.id)}
      />
    </div>
  );
}

export default ListProducts;
