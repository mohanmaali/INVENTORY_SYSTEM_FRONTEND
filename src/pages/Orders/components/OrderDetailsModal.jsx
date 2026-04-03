import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button, Modal } from '../../../components/ui';
import { deleteOrder, updateOrderStatus } from '../../../services/orders';
import { formatDateTime } from '../../../utils/formatDate';
import {
  formatOrderCurrency,
  getAvailableStatusOptions,
  getOrderStatusClassName,
  getPartnerLabel,
  inputClasses,
} from '../orderConfig';

function OrderDetailsModal({
  isOpen,
  onClose,
  order,
  timeline,
  loading,
  canUpdate,
  canDelete,
  onUpdated,
}) {
  const [nextStatus, setNextStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const availableStatuses = getAvailableStatusOptions(order);
  const orderId = order?._id || order?.id;

  useEffect(() => {
    if (!isOpen) {
      setNextStatus('');
      setStatusNote('');
      setSubmittingStatus(false);
      setCancelling(false);
      return;
    }

    setNextStatus(availableStatuses[0] || '');
    setStatusNote('');
  }, [isOpen, order?.status]);

  const handleStatusSubmit = async (event) => {
    event.preventDefault();

    if (!orderId || !nextStatus) return;

    setSubmittingStatus(true);

    try {
      await updateOrderStatus(orderId, {
        status: nextStatus,
        note: statusNote.trim() || undefined,
      });
      toast.success('Order status updated successfully');
      setStatusNote('');
      onUpdated();
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to update order status';
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
      onUpdated();
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to cancel order';
      toast.error(message);
    } finally {
      setCancelling(false);
    }
  };

  const partner = order?.type === 'purchase' ? order?.supplier : order?.customer;
  const timelineEntries = timeline?.timeline || order?.statusHistory || [];

  return (
    <Modal isOpen={isOpen} onClose={submittingStatus || cancelling ? () => {} : onClose} className="max-w-6xl">
      <div className="flex max-h-[85vh] flex-col">
        <div className="border-b border-gray-100 px-6 py-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {order?.orderNumber || 'Order Details'}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Review line items, partner details, timeline, and status changes.
              </p>
            </div>
            {order?.status && (
              <span className={`inline-flex rounded-md px-3 py-1 text-sm font-medium capitalize ${getOrderStatusClassName(order.status)}`}>
                {order.status}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading || !order ? (
            <p className="text-sm text-gray-500">Loading order details...</p>
          ) : (
            <div className="space-y-6">
              <section className="grid gap-4 lg:grid-cols-4">
                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Order Type</p>
                  <p className="mt-2 text-sm font-semibold capitalize text-gray-900">{order.type}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Total Amount</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">{formatOrderCurrency(order.totalAmount)}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Created At</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">{formatDateTime(order.createdAt)}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Stock Movement</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">{order.stockMoved ? 'Applied' : 'Pending'}</p>
                </div>
              </section>

              <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                  <h3 className="text-base font-semibold text-gray-900">Order Items</h3>
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
                            <td className="px-4 py-4">
                              <div className="font-medium text-gray-900">{item.product?.name || 'Unknown product'}</div>
                              <div className="text-xs text-gray-500">{item.product?.sku || 'No SKU'}</div>
                            </td>
                            <td className="px-4 py-4 text-gray-600">{item.quantity}</td>
                            <td className="px-4 py-4 text-gray-600">{formatOrderCurrency(item.unitPrice)}</td>
                            <td className="px-4 py-4 text-gray-600">{formatOrderCurrency(item.subtotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-6">
                  <section className="rounded-2xl border border-gray-200 bg-white p-5">
                    <h3 className="text-base font-semibold text-gray-900">{getPartnerLabel(order.type)} Details</h3>
                    <div className="mt-4 space-y-2 text-sm text-gray-600">
                      <p className="font-medium text-gray-900">{partner?.name || 'Not available'}</p>
                      {partner?.contact && <p>{partner.contact}</p>}
                      {partner?.email && <p>{partner.email}</p>}
                      {partner?.address && <p>{partner.address}</p>}
                    </div>
                  </section>

                  <section className="rounded-2xl border border-gray-200 bg-white p-5">
                    <h3 className="text-base font-semibold text-gray-900">Order Note</h3>
                    <p className="mt-3 text-sm text-gray-600">{order.note || 'No note added.'}</p>
                  </section>

                  <section className="rounded-2xl border border-gray-200 bg-white p-5">
                    <h3 className="text-base font-semibold text-gray-900">Status Timeline</h3>
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
                  </section>
                </div>
              </section>

              {canUpdate && availableStatuses.length > 0 && (
                <section className="rounded-2xl border border-gray-200 bg-white p-5">
                  <h3 className="text-base font-semibold text-gray-900">Update Status</h3>
                  <form onSubmit={handleStatusSubmit} className="mt-4 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_auto]">
                    <select value={nextStatus} onChange={(event) => setNextStatus(event.target.value)} className={inputClasses}>
                      {availableStatuses.map((statusOption) => (
                        <option key={statusOption} value={statusOption}>
                          {statusOption}
                        </option>
                      ))}
                    </select>
                    <input value={statusNote} onChange={(event) => setStatusNote(event.target.value)} className={inputClasses} placeholder="Add update note" />
                    <Button type="submit" disabled={submittingStatus || !nextStatus}>
                      {submittingStatus ? 'Updating...' : 'Update Status'}
                    </Button>
                  </form>
                </section>
              )}

              {canDelete && order.status === 'pending' && (
                <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-red-800">Cancel Pending Order</h3>
                      <p className="mt-1 text-sm text-red-700">
                        Pending orders can be cancelled from here using the delete endpoint.
                      </p>
                    </div>
                    <Button type="button" className="bg-red-600 text-white hover:bg-red-700" onClick={handleCancelOrder} disabled={cancelling}>
                      {cancelling ? 'Cancelling...' : 'Cancel Order'}
                    </Button>
                  </div>
                </section>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 px-6 py-4">
          <div className="flex justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default OrderDetailsModal;
