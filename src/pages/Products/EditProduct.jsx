import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Button, Card, Input, Pagination } from '../../components/ui';
import usePermissions from '../../hooks/usePermissions';
import {
  adjustProductStock,
  getProductById,
  getProductStockHistory,
  updateProduct,
} from '../../services/products';
import {
  formatCurrency,
  STOCK_ADJUSTMENT_TYPES,
} from './productConfig';
import ProductForm from './components/ProductForm';

function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const permissions = usePermissions('products');
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyMeta, setHistoryMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [stockForm, setStockForm] = useState({
    type: 'restock',
    delta: '',
    note: '',
  });
  const [stockLoading, setStockLoading] = useState(false);
  const [stockError, setStockError] = useState('');

  const historyPage = Math.max(Number(searchParams.get('historyPage')) || 1, 1);
  const historyLimit = Math.max(Number(searchParams.get('historyLimit')) || 10, 1);
  const historyTotalPages = useMemo(() => {
    const total = Number(historyMeta.total) || 0;
    const currentLimit = Number(historyMeta.limit) || historyLimit;
    return Math.max(1, Math.ceil(total / currentLimit));
  }, [historyMeta.total, historyMeta.limit, historyLimit]);

  const backTarget = `/inventory?page=${searchParams.get('page') || '1'}&limit=${
    searchParams.get('limit') || '10'
  }${searchParams.get('search') ? `&search=${encodeURIComponent(searchParams.get('search'))}` : ''}${
    searchParams.get('status') ? `&status=${encodeURIComponent(searchParams.get('status'))}` : ''
  }${searchParams.get('category') ? `&category=${encodeURIComponent(searchParams.get('category'))}` : ''}${
    searchParams.get('supplier') ? `&supplier=${encodeURIComponent(searchParams.get('supplier'))}` : ''
  }`;

  const formValues = useMemo(
    () => ({
      name: product?.name || '',
      sku: product?.sku || '',
      price: product?.price ?? '',
      quantity: product?.quantity ?? '',
      supplier: product?.supplier?._id || product?.supplier?.id || product?.supplier || '',
      category: product?.category || '',
      unit: product?.unit || '',
      lowStockThreshold: product?.lowStockThreshold ?? 10,
      status: product?.status || 'active',
    }),
    [product]
  );

  const loadHistory = async () => {
    try {
      const res = await getProductStockHistory(id, {
        page: historyPage,
        limit: historyLimit,
      });
      setHistory(Array.isArray(res?.data) ? res.data : []);
      setHistoryMeta({
        page: res?.meta?.page || historyPage,
        limit: res?.meta?.limit || historyLimit,
        total: res?.meta?.total || 0,
      });
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to load stock history';
      toast.error(message);
    }
  };

  useEffect(() => {
    if (permissions.loading) {
      return;
    }

    if (!permissions.canRead && !permissions.canUpdate) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);

      try {
        const productRes = await getProductById(id);

        setProduct(productRes);
      } catch (err) {
        const message =
          err.response?.data?.message || err.message || 'Failed to load product details';
        toast.error(message);
        navigate('/inventory');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, navigate, permissions.loading, permissions.canRead, permissions.canUpdate]);

  useEffect(() => {
    if (permissions.loading || !permissions.canRead) {
      return;
    }

    loadHistory();
  }, [id, historyPage, historyLimit, permissions.loading, permissions.canRead]);

  const handleSubmit = async (payload) => {
    await updateProduct(id, payload);
    toast.success('Product updated successfully');
    navigate(backTarget);
  };

  const handleStockChange = (event) => {
    const { name, value } = event.target;
    setStockForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleStockSubmit = async (event) => {
    event.preventDefault();
    setStockError('');

    const payload = {
      type: stockForm.type,
      delta: Number(stockForm.delta),
      note: stockForm.note.trim() || undefined,
    };

    if (!payload.type || !payload.delta) {
      setStockError('Type and non-zero delta are required.');
      return;
    }

    setStockLoading(true);

    try {
      const data = await adjustProductStock(id, payload);
      setProduct(data?.product || product);
      setStockForm({
        type: 'restock',
        delta: '',
        note: '',
      });
      toast.success('Stock updated successfully');
      await loadHistory();
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to update stock';
      setStockError(message);
      toast.error(message);
    } finally {
      setStockLoading(false);
    }
  };

  const updateHistoryParams = (nextValues) => {
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

  if (!permissions.loading && !permissions.canUpdate) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">No Access</h2>
        <p className="mt-2 text-sm text-gray-600">
          You do not have permission to update products.
        </p>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Update Product</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            Edit product details and manage stock movements.
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={() => navigate(backTarget)}>
          Back to Products
        </Button>
      </div>

      <Card className="overflow-hidden rounded-3xl border border-gray-200 p-0 shadow-sm">
        {loading ? (
          <div className="p-6">
            <p className="text-sm text-gray-500">Loading product details...</p>
          </div>
        ) : (
          <>
            <div className="border-b border-gray-100 bg-gradient-to-r from-sky-50 via-white to-slate-50 px-6 py-5">
              <h2 className="text-lg font-semibold text-gray-900">Edit Product</h2>
              <p className="mt-1 text-sm text-gray-500">
                Update product details without losing the original inventory context.
              </p>
            </div>

            <div className="p-6">
              <ProductForm
                initialValues={formValues}
                mode="edit"
                onSubmit={handleSubmit}
                submitLabel="Update Product"
                submittingLabel="Updating Product..."
                cancelLabel="Back to Products"
                onCancel={() => navigate(backTarget)}
              />
            </div>
          </>
        )}
      </Card>

      {product && permissions.canUpdate && (
        <Card className="rounded-3xl border border-gray-200 p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Stock Adjustment</h2>
            <p className="mt-1 text-sm text-gray-500">
              Current stock: {product.quantity} {product.unit || 'pcs'} | Price:{' '}
              {formatCurrency(product.price)}
            </p>
          </div>

          <form onSubmit={handleStockSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  name="type"
                  value={stockForm.type}
                  onChange={handleStockChange}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {STOCK_ADJUSTMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delta
                </label>
                <Input
                  name="delta"
                  type="number"
                  value={stockForm.delta}
                  onChange={handleStockChange}
                  placeholder="Enter stock adjustment"
                  className="rounded-lg border-gray-200 px-3 py-2.5 text-sm shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note
                </label>
                <Input
                  name="note"
                  value={stockForm.note}
                  onChange={handleStockChange}
                  placeholder="Enter adjustment note"
                  className="rounded-lg border-gray-200 px-3 py-2.5 text-sm shadow-sm"
                />
              </div>
            </div>

            {stockError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {stockError}
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-2">
              <Button type="submit" disabled={stockLoading}>
                {stockLoading ? 'Updating Stock...' : 'Update Stock'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {permissions.canRead && (
        <Card className="rounded-3xl border border-gray-200 p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Stock History</h2>
            <p className="mt-1 text-sm text-gray-500">
              Recent stock movement log for this product.
            </p>
          </div>

          {history.length === 0 ? (
            <p className="text-sm text-gray-500">No stock history found.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold">Delta</th>
                    <th className="px-4 py-3 font-semibold">Before</th>
                    <th className="px-4 py-3 font-semibold">After</th>
                    <th className="px-4 py-3 font-semibold">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {history.map((log) => (
                    <tr key={log._id || log.id}>
                      <td className="px-4 py-4 capitalize text-gray-700">{log.type}</td>
                      <td className="px-4 py-4 text-gray-700">{log.delta}</td>
                      <td className="px-4 py-4 text-gray-700">{log.quantityBefore}</td>
                      <td className="px-4 py-4 text-gray-700">{log.quantityAfter}</td>
                      <td className="px-4 py-4 text-gray-600">{log.note || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Pagination
            className="mt-6"
            page={historyPage}
            totalPages={historyTotalPages}
            totalItems={historyMeta.total}
            loading={false}
            perPage={historyLimit}
            onPerPageChange={(nextLimit) =>
              updateHistoryParams({ historyPage: 1, historyLimit: nextLimit })
            }
            onPageChange={(nextPage) =>
              updateHistoryParams({ historyPage: nextPage, historyLimit })
            }
          />
        </Card>
      )}
    </div>
  );
}

export default EditProduct;
