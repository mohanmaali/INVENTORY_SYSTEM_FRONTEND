import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaEdit, FaEye, FaPlus } from 'react-icons/fa';
import { Button, Card, ConfirmationModal, Input, Pagination } from '../../../components/ui';
import usePermissions from '../../../hooks/usePermissions';
import { deleteOrder, getOrders, permanentlyDeleteOrder } from '../../../services/orders';
import { getSuppliers } from '../../../services/suppliers';
import { formatDateTime } from '../../../utils/formatDate';
import {
  formatOrderCurrency,
  getOrderStatusClassName,
  getOrderTypeLabel,
  inputClasses,
  ORDER_STATUS_OPTIONS,
} from '../orderConfig';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

function OrderListPage({ type }) {
  const navigate = useNavigate();
  const permissions = usePermissions('orders');
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [meta, setMeta] = useState({ page: DEFAULT_PAGE, limit: DEFAULT_LIMIT, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [status, setStatus] = useState('');
  const [supplier, setSupplier] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [cancellingOrderId, setCancellingOrderId] = useState('');
  const [deletingOrderId, setDeletingOrderId] = useState('');
  const [confirmCancelOrder, setConfirmCancelOrder] = useState(null);
  const [confirmDeleteOrder, setConfirmDeleteOrder] = useState(null);

  const totalPages = useMemo(() => {
    const total = Number(meta.total) || 0;
    const currentLimit = Number(meta.limit) || limit;
    return Math.max(1, Math.ceil(total / currentLimit));
  }, [meta.total, meta.limit, limit]);

  const listPath = type === 'purchase' ? '/orders/purchase' : '/orders/sales';
  const addPath = `${listPath}/add`;

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await getOrders({
        page,
        limit,
        type,
        status: status || undefined,
        supplier: type === 'purchase' ? supplier || undefined : undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      });
      setOrders(Array.isArray(res?.data) ? res.data : []);
      setMeta({
        page: res?.meta?.page || page,
        limit: res?.meta?.limit || limit,
        total: res?.meta?.total || 0,
      });
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to load orders';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const loadSuppliers = async () => {
    if (type !== 'purchase') return;
    try {
      const res = await getSuppliers({ page: 1, limit: 100 });
      setSuppliers(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to load suppliers';
      toast.error(message);
    }
  };

  useEffect(() => {
    if (permissions.loading || !permissions.canRead) {
      setLoading(false);
      return;
    }
    loadSuppliers();
  }, [permissions.loading, permissions.canRead, type]);

  useEffect(() => {
    if (permissions.loading || !permissions.canRead) {
      setLoading(false);
      return;
    }
    loadOrders();
  }, [page, limit, type, status, supplier, fromDate, toDate, permissions.loading, permissions.canRead]);

  const handleQuickCancel = async (orderId) => {
    setCancellingOrderId(orderId);
    try {
      await deleteOrder(orderId);
      toast.success('Order cancelled successfully');
      const shouldGoBack = orders.length === 1 && page > 1;
      if (shouldGoBack) {
        setPage((current) => current - 1);
      } else {
        await loadOrders();
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to cancel order';
      toast.error(message);
    } finally {
      setCancellingOrderId('');
    }
  };

  const handlePermanentDelete = async (orderId) => {
    setDeletingOrderId(orderId);
    try {
      await permanentlyDeleteOrder(orderId);
      toast.success('Order deleted permanently');
      const shouldGoBack = orders.length === 1 && page > 1;
      if (shouldGoBack) {
        setPage((current) => current - 1);
      } else {
        await loadOrders();
      }
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to delete order';
      toast.error(message);
    } finally {
      setDeletingOrderId('');
    }
  };

  if (!permissions.loading && !permissions.canRead) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">No Access</h2>
        <p className="mt-2 text-sm text-gray-600">You do not have permission to view orders.</p>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            {type === 'purchase' ? 'Purchase Order List' : 'Sales Order List'}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            Review order history, track status, and open full order details.
          </p>
        </div>
        {permissions.canCreate && (
          <Button type="button" onClick={() => navigate(addPath)}>
            <span className="inline-flex items-center gap-2">
              <FaPlus className="h-3.5 w-3.5" />
              {type === 'purchase' ? 'Add Purchase Order' : 'Add Sales Order'}
            </span>
          </Button>
        )}
      </div>

      <Card className="rounded-3xl border border-gray-200 p-6 shadow-sm">
        <div className="mb-6 grid gap-4 lg:grid-cols-4 xl:grid-cols-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Status</label>
            <select value={status} onChange={(event) => { setPage(DEFAULT_PAGE); setStatus(event.target.value); }} className={inputClasses}>
              <option value="">All statuses</option>
              {ORDER_STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          {type === 'purchase' && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Supplier</label>
              <select value={supplier} onChange={(event) => { setPage(DEFAULT_PAGE); setSupplier(event.target.value); }} className={inputClasses}>
                <option value="">All suppliers</option>
                {suppliers.map((supplierItem) => {
                  const supplierId = supplierItem._id || supplierItem.id;
                  return <option key={supplierId} value={supplierId}>{supplierItem.name}</option>;
                })}
              </select>
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">From Date</label>
            <Input type="date" value={fromDate} onChange={(event) => { setPage(DEFAULT_PAGE); setFromDate(event.target.value); }} className="rounded-lg border-gray-200 px-3 py-2.5 text-sm shadow-sm" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">To Date</label>
            <Input type="date" value={toDate} onChange={(event) => { setPage(DEFAULT_PAGE); setToDate(event.target.value); }} className="rounded-lg border-gray-200 px-3 py-2.5 text-sm shadow-sm" />
          </div>
          <div className="flex items-end">
            <Button type="button" variant="secondary" className="w-full" onClick={() => { setPage(DEFAULT_PAGE); setStatus(''); setSupplier(''); setFromDate(''); setToDate(''); }}>
              Clear Filters
            </Button>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-gray-500">No {type} orders found.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">{type === 'purchase' ? 'Supplier' : 'Customer'}</th>
                  <th className="px-4 py-3 font-semibold">Items</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {orders.map((order) => {
                  const orderId = order._id || order.id;
                  const customerData = order.customerRecord || order.customer;
                  const partner = type === 'purchase' ? order.supplier?.name : customerData?.name;
                  return (
                    <tr key={orderId} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900">{order.orderNumber}</div>
                        <div className="text-xs text-gray-500">{getOrderTypeLabel(order.type)}</div>
                      </td>
                      <td className="px-4 py-4 text-gray-600">{partner || 'Not available'}</td>
                      <td className="px-4 py-4 text-gray-600">{order.items?.length || 0}</td>
                      <td className="px-4 py-4 text-gray-600">{formatOrderCurrency(order.totalAmount)}</td>
                      <td className="px-4 py-4 text-gray-600">{formatDateTime(order.createdAt)}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-md px-3 py-1 capitalize ${getOrderStatusClassName(order.status)}`}>{order.status}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="secondary" className="inline-flex items-center gap-2 px-3 py-1.5" onClick={() => navigate(`${listPath}/${orderId}`)}>
                            <FaEye className="h-3.5 w-3.5" />
                            View
                          </Button>
                          {permissions.canUpdate && order.status === 'pending' && (
                            <Button
                              type="button"
                              variant="secondary"
                              className="inline-flex items-center gap-2 px-3 py-1.5"
                              onClick={() => navigate(`${listPath}/${orderId}/edit`)}
                            >
                              <FaEdit className="h-3.5 w-3.5" />
                              Edit
                            </Button>
                          )}
                          {permissions.canDelete && order.status === 'pending' && (
                            <Button
                              type="button"
                              variant="ghost"
                              className="inline-flex items-center gap-2 px-3 py-1.5"
                              onClick={() =>
                                setConfirmCancelOrder({
                                  id: orderId,
                                  name: order.orderNumber || 'this order',
                                })
                              }
                              disabled={cancellingOrderId === orderId}
                            >
                              {cancellingOrderId === orderId ? 'Cancelling...' : 'Cancel'}
                            </Button>
                          )}
                          {permissions.canDelete &&
                            ['pending', 'cancelled'].includes(order.status) && (
                              <Button
                                type="button"
                                variant="ghost"
                                className="inline-flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50"
                                onClick={() =>
                                  setConfirmDeleteOrder({
                                    id: orderId,
                                    name: order.orderNumber || 'this order',
                                  })
                                }
                                disabled={deletingOrderId === orderId}
                              >
                                {deletingOrderId === orderId ? 'Deleting...' : 'Delete'}
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

        <Pagination className="mt-6" page={page} totalPages={totalPages} totalItems={meta.total} loading={loading} perPage={limit} onPerPageChange={(nextLimit) => { setPage(DEFAULT_PAGE); setLimit(nextLimit); }} onPageChange={(nextPage) => setPage(nextPage)} />
      </Card>

      <ConfirmationModal
        isOpen={Boolean(confirmCancelOrder)}
        onClose={() => setConfirmCancelOrder(null)}
        onConfirm={async () => {
          if (!confirmCancelOrder) return;
          await handleQuickCancel(confirmCancelOrder.id);
          setConfirmCancelOrder(null);
        }}
        title="Cancel Order"
        message={`Are you sure you want to cancel ${confirmCancelOrder?.name}?`}
        confirmText="Cancel Order"
        loading={Boolean(confirmCancelOrder && cancellingOrderId === confirmCancelOrder.id)}
      />

      <ConfirmationModal
        isOpen={Boolean(confirmDeleteOrder)}
        onClose={() => setConfirmDeleteOrder(null)}
        onConfirm={async () => {
          if (!confirmDeleteOrder) return;
          await handlePermanentDelete(confirmDeleteOrder.id);
          setConfirmDeleteOrder(null);
        }}
        title="Delete Order Permanently"
        message={`Are you sure you want to permanently delete ${confirmDeleteOrder?.name}? This action removes the order history and cannot be undone.`}
        confirmText="Delete Permanently"
        loading={Boolean(confirmDeleteOrder && deletingOrderId === confirmDeleteOrder.id)}
      />
    </div>
  );
}

export default OrderListPage;
