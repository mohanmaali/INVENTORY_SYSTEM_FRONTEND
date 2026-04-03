import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Button, Card, Pagination } from '../../components/ui';
import usePermissions from '../../hooks/usePermissions';
import { getProductById, getProductStockHistory } from '../../services/products';
import { formatCurrency, getProductStatusClassName } from './productConfig';

function ProductDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const permissions = usePermissions('inventory');
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyMeta, setHistoryMeta] = useState({ page: 1, limit: 10, total: 0 });

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

  const loadHistory = async () => {
    try {
      const res = await getProductStockHistory(id, { page: historyPage, limit: historyLimit });
      setHistory(Array.isArray(res?.data) ? res.data : []);
      setHistoryMeta({
        page: res?.meta?.page || historyPage,
        limit: res?.meta?.limit || historyLimit,
        total: res?.meta?.total || 0,
      });
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to load stock history';
      toast.error(message);
    }
  };

  useEffect(() => {
    if (permissions.loading || !permissions.canRead) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const productRes = await getProductById(id);
        setProduct(productRes);
      } catch (err) {
        const message = err.response?.data?.message || err.message || 'Failed to load product details';
        toast.error(message);
        navigate('/inventory');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, navigate, permissions.loading, permissions.canRead]);

  useEffect(() => {
    if (permissions.loading || !permissions.canRead) return;
    loadHistory();
  }, [id, historyPage, historyLimit, permissions.loading, permissions.canRead]);

  const updateHistoryParams = (nextValues) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(nextValues).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) next.delete(key);
      else next.set(key, String(value));
    });
    setSearchParams(next);
  };

  if (!permissions.loading && !permissions.canRead) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">No Access</h2>
        <p className="mt-2 text-sm text-gray-600">You do not have permission to view products.</p>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            {product?.name || 'Product Details'}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            View product profile, stock status, and history.
          </p>
        </div>
        <div className="flex gap-3">
          {permissions.canUpdate && product && (
            <Button type="button" onClick={() => navigate(`/inventory/${id}/edit`)}>
              Edit Product
            </Button>
          )}
          <Button type="button" variant="secondary" onClick={() => navigate(backTarget)}>
            Back to Products
          </Button>
        </div>
      </div>

      {loading || !product ? (
        <Card className="p-6">
          <p className="text-sm text-gray-500">Loading product details...</p>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className="rounded-2xl border border-gray-200 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-gray-500">SKU</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">{product.sku || '-'}</p>
            </Card>
            <Card className="rounded-2xl border border-gray-200 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-gray-500">Price</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">{formatCurrency(product.price)}</p>
            </Card>
            <Card className="rounded-2xl border border-gray-200 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-gray-500">Stock</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {product.quantity} {product.unit || 'pcs'}
              </p>
            </Card>
            <Card className="rounded-2xl border border-gray-200 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-gray-500">Status</p>
              <div className="mt-1">
                <span className={`inline-flex rounded-md px-3 py-1 capitalize ${getProductStatusClassName(product.status)}`}>
                  {product.status}
                </span>
              </div>
            </Card>
          </div>

          <Card className="rounded-3xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Product Information</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Name</p>
                <p className="mt-1 text-sm text-gray-900">{product.name}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Category</p>
                <p className="mt-1 text-sm text-gray-900">{product.category || '-'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Supplier</p>
                <p className="mt-1 text-sm text-gray-900">{product.supplier?.name || 'No supplier'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Low Stock Threshold</p>
                <p className="mt-1 text-sm text-gray-900">{product.lowStockThreshold ?? '-'}</p>
              </div>
            </div>
          </Card>

          <Card className="rounded-3xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Stock History</h2>
            <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200">
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
                  {history.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-4 text-gray-500">
                        No stock history found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              className="mt-6"
              page={historyPage}
              totalPages={historyTotalPages}
              totalItems={historyMeta.total}
              loading={false}
              perPage={historyLimit}
              onPerPageChange={(nextLimit) => updateHistoryParams({ historyPage: 1, historyLimit: nextLimit })}
              onPageChange={(nextPage) => updateHistoryParams({ historyPage: nextPage, historyLimit })}
            />
          </Card>
        </>
      )}
    </div>
  );
}

export default ProductDetails;
