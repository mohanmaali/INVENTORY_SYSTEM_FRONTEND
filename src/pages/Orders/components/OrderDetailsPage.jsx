import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaEnvelope, FaMapMarkerAlt, FaPhone, FaUser } from 'react-icons/fa';
import usePermissions from '../../../hooks/usePermissions';
import { deleteOrder, getOrderById, getOrderTimeline, permanentlyDeleteOrder, updateOrderStatus } from '../../../services/orders';
import { formatDateTime } from '../../../utils/formatDate';
import { formatOrderCurrency, getAvailableStatusOptions, getOrderStatusClassName, getPartnerLabel, inputClasses } from '../orderConfig';
import { Button, Card, ConfirmationModal } from '../../../components/ui';

const formatPartnerAddress = (address) => {
  if (!address) return '';
  if (typeof address === 'string') return address;

  return [
    address.street,
    address.city,
    address.state,
    address.zipCode,
    address.country,
  ]
    .filter(Boolean)
    .join(', ');
};

function OrderDetailsPage({ type }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const permissions = usePermissions('orders');
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [nextStatus, setNextStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const listPath = type === 'purchase' ? '/orders/purchase' : '/orders/sales';
  const orderId = order?._id || order?.id;
  const availableStatuses = getAvailableStatusOptions(order);
  const customerData = order?.customerRecord || order?.customer;
  const partner = order?.type === 'purchase' ? order?.supplier : customerData;
  const partnerAddress = formatPartnerAddress(partner?.address);
  const timelineEntries = timeline?.timeline || order?.statusHistory || [];

  const loadOrder = async () => {
    setLoading(true);
    try {
      const [orderRes, timelineRes] = await Promise.all([getOrderById(id), getOrderTimeline(id)]);
      setOrder(orderRes);
      setTimeline(timelineRes);
      setNextStatus(getAvailableStatusOptions(orderRes)[0] || '');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to load order details';
      toast.error(message);
      navigate(listPath);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (permissions.loading || !permissions.canRead) {
      setLoading(false);
      return;
    }
    loadOrder();
  }, [id, permissions.loading, permissions.canRead]);

  const handleStatusSubmit = async (event) => {
    event.preventDefault();
    if (!orderId || !nextStatus) return;
    setSubmittingStatus(true);
    try {
      await updateOrderStatus(orderId, { status: nextStatus, note: statusNote.trim() || undefined });
      toast.success('Order status updated successfully');
      setStatusNote('');
      await loadOrder();
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to update order status';
      toast.error(message);
    } finally {
      setSubmittingStatus(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!orderId) return;
    setCancelling(true);
    try {
      await deleteOrder(orderId);
      toast.success('Order cancelled successfully');
      navigate(listPath);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to cancel order';
      toast.error(message);
    } finally {
      setCancelling(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (!orderId) return;
    setDeleting(true);
    try {
      await permanentlyDeleteOrder(orderId);
      toast.success('Order deleted permanently');
      navigate(listPath);
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to delete order';
      toast.error(message);
    } finally {
      setDeleting(false);
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
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">{order?.orderNumber || 'Order Details'}</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">Review order items, partner information, timeline, and status updates.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {permissions.canUpdate && order?.status === 'pending' && (
            <Button type="button" onClick={() => navigate(`${listPath}/${id}/edit`)}>
              Edit Order
            </Button>
          )}
          {permissions.canDelete && ['pending', 'cancelled'].includes(order?.status) && (
            <Button
              type="button"
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => setConfirmDeleteOpen(true)}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          )}
          <Button type="button" variant="secondary" onClick={() => navigate(listPath)}>Back to Order List</Button>
        </div>
      </div>

      {loading || !order ? (
        <Card  className="p-6"><p className="text-sm text-gray-500">Loading order details...</p></Card>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-4">
            <Card className="rounded-2xl border border-gray-200 p-4 shadow-sm"><p className="text-xs font-medium uppercase tracking-wide text-gray-500">Order Type</p><p className="mt-2 text-sm font-semibold capitalize text-gray-900">{order.type}</p></Card>
            <Card className="rounded-2xl border border-gray-200 p-4 shadow-sm"><p className="text-xs font-medium uppercase tracking-wide text-gray-500">Total Amount</p><p className="mt-2 text-sm font-semibold text-gray-900">{formatOrderCurrency(order.totalAmount)}</p></Card>
            <Card className="rounded-2xl border border-gray-200 p-4 shadow-sm"><p className="text-xs font-medium uppercase tracking-wide text-gray-500">Created At</p><p className="mt-2 text-sm font-semibold text-gray-900">{formatDateTime(order.createdAt)}</p></Card>
            <Card className="rounded-2xl border border-gray-200 p-4 shadow-sm"><p className="text-xs font-medium uppercase tracking-wide text-gray-500">Status</p><div className="mt-2"><span className={`inline-flex rounded-md px-3 py-1 text-sm font-medium capitalize ${getOrderStatusClassName(order.status)}`}>{order.status}</span></div></Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <Card className="rounded-3xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
              <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                      <th className="px-4 py-3 font-semibold">Product</th>
                      <th className="px-4 py-3 font-semibold">Quantity</th>
                      <th className="px-4 py-3 font-semibold">Unit Price</th>
                      <th className="px-4 py-3 font-semibold">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {(order.items || []).map((item, index) => (
                      <tr key={`${item.product?._id || item.product?.id || index}`}>
                        <td className="px-4 py-4"><div className="font-medium text-gray-900">{item.product?.name || 'Unknown product'}</div><div className="text-xs text-gray-500">{item.product?.sku || 'No SKU'}</div></td>
                        <td className="px-4 py-4 text-gray-600">{item.quantity}</td>
                        <td className="px-4 py-4 text-gray-600">{formatOrderCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-4 text-gray-600">{formatOrderCurrency(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <div className="space-y-6">
              <Card className="rounded-3xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">{getPartnerLabel(order.type)} Details</h2>
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FaUser className="text-gray-400" />
                    <p className="font-medium text-gray-900">{partner?.name || 'Not available'}</p>
                  </div>
                  {(partner?.contact || partner?.phone) && (
                    <div className="flex items-center gap-2">
                      <FaPhone className="text-gray-400" />
                      <p>{partner?.contact || partner?.phone}</p>
                    </div>
                  )}
                  {partner?.email && (
                    <div className="flex items-center gap-2">
                      <FaEnvelope className="text-gray-400" />
                      <p>{partner.email}</p>
                    </div>
                  )}
                  {partnerAddress && (
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-gray-400" />
                      <p>{partnerAddress}</p>
                    </div>
                  )}
                </div>
              </Card>
              <Card className="rounded-3xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">Order Note</h2>
                <p className="mt-3 text-sm text-gray-600">{order.note || 'No note added.'}</p>
              </Card>
            </div>
          </div>

          <Card className="rounded-3xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Status Timeline</h2>
            <div className="mt-4 space-y-4">
              {timelineEntries.map((entry, index) => (
                <div key={`${entry.changedAt || index}`} className="flex gap-3">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                  <div>
                    <p className="text-sm font-medium capitalize text-gray-900">{entry.status}</p>
                    <p className="text-xs text-gray-500">{formatDateTime(entry.changedAt)}</p>
                    {entry.note ? <p className="mt-1 text-sm text-gray-600">{entry.note}</p> : null}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {permissions.canUpdate && availableStatuses.length > 0 && (
            <Card className="rounded-3xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Update Status</h2>
              <form onSubmit={handleStatusSubmit} className="mt-4 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_auto]">
                <select value={nextStatus} onChange={(event) => setNextStatus(event.target.value)} className={inputClasses}>
                  {availableStatuses.map((statusOption) => <option key={statusOption} value={statusOption}>{statusOption}</option>)}
                </select>
                <input value={statusNote} onChange={(event) => setStatusNote(event.target.value)} className={inputClasses} placeholder="Add update note" />
                <Button type="submit" disabled={submittingStatus || !nextStatus}>{submittingStatus ? 'Updating...' : 'Update Status'}</Button>
              </form>
            </Card>
          )}

          {permissions.canDelete && order.status === 'pending' && (
            <Card className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-red-800">Cancel Pending Order</h2>
                  <p className="mt-1 text-sm text-red-700">Pending orders can be cancelled from this page.</p>
                </div>
                <Button
                  type="button"
                  className="bg-red-600 text-white hover:bg-red-700"
                  onClick={() => setConfirmCancelOpen(true)}
                  disabled={cancelling}
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Order'}
                </Button>
              </div>
            </Card>
          )}
        </>
      )}

      <ConfirmationModal
        isOpen={confirmCancelOpen}
        onClose={() => setConfirmCancelOpen(false)}
        onConfirm={async () => {
          await handleCancelOrder();
          setConfirmCancelOpen(false);
        }}
        title="Cancel Order"
        message={`Are you sure you want to cancel ${order?.orderNumber || 'this order'}?`}
        confirmText="Cancel Order"
        loading={cancelling}
      />

      <ConfirmationModal
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={async () => {
          await handlePermanentDelete();
          setConfirmDeleteOpen(false);
        }}
        title="Delete Order Permanently"
        message={`Are you sure you want to permanently delete ${order?.orderNumber || 'this order'}? This action removes the order history and cannot be undone.`}
        confirmText="Delete Permanently"
        loading={deleting}
      />
    </div>
  );
}

export default OrderDetailsPage;
