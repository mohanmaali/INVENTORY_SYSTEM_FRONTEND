import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Button, Card, Pagination } from '../../components/ui';
import usePermissions from '../../hooks/usePermissions';
import { getCustomerById, getCustomerOrders, getCustomerSummary } from '../../services/customers';
import { formatDateTime } from '../../utils/formatDate';
import {
  formatCustomerCurrency,
  getCustomerAddressText,
  getCustomerStatusClassName,
  getCustomerSummaryCards,
} from './customerConfig';

const getMostPurchasedProductText = (value) => {
  if (!value) return 'Not available';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const name = value.name || value.sku || value.productId;
    return name ? `${name}${value.totalQuantity ? ` (${value.totalQuantity})` : ''}` : 'Not available';
  }
  return 'Not available';
};

function CustomerDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const permissions = usePermissions('customers');
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersMeta, setOrdersMeta] = useState({ page: 1, limit: 10, total: 0 });

  const summaryCards = useMemo(() => getCustomerSummaryCards(summary || {}), [summary]);
  const totalPages = useMemo(() => {
    const total = Number(ordersMeta.total) || 0;
    const currentLimit = Number(ordersMeta.limit) || 10;
    return Math.max(1, Math.ceil(total / currentLimit));
  }, [ordersMeta.total, ordersMeta.limit]);

  const loadCustomer = async () => {
    setLoading(true);
    try {
      const [customerRes, summaryRes, ordersRes] = await Promise.all([
        getCustomerById(id),
        getCustomerSummary(id),
        getCustomerOrders(id, { page: ordersMeta.page, limit: ordersMeta.limit }),
      ]);

      const ordersPayload = Array.isArray(ordersRes?.orders)
        ? ordersRes
        : {
            orders: Array.isArray(ordersRes?.data?.orders) ? ordersRes.data.orders : [],
            meta: ordersRes?.meta || {},
          };

      setCustomer(customerRes);
      setSummary(summaryRes);
      setOrders(Array.isArray(ordersPayload.orders) ? ordersPayload.orders : []);
      setOrdersMeta({
        page: ordersPayload?.meta?.page || ordersMeta.page,
        limit: ordersPayload?.meta?.limit || ordersMeta.limit,
        total: ordersPayload?.meta?.total || 0,
      });
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to load customer details';
      toast.error(message);
      navigate('/customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (permissions.loading || !permissions.canRead) {
      setLoading(false);
      return;
    }
    loadCustomer();
  }, [id, ordersMeta.page, ordersMeta.limit, permissions.loading, permissions.canRead]);

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
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">{customer?.name || 'Customer Profile'}</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">Review customer profile, summary, and sales order history.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {permissions.canUpdate && customer && (
            <Button type="button" onClick={() => navigate(`/customers/${id}/edit`)}>
              Edit Customer
            </Button>
          )}
          <Button type="button" variant="secondary" onClick={() => navigate('/customers')}>
            Back to Customers
          </Button>
        </div>
      </div>

      {loading || !customer ? (
        <Card className="p-6">
          <p className="text-sm text-gray-500">Loading customer profile...</p>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((item) => (
              <Card key={item.label} className="rounded-2xl border border-gray-200 p-4 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{item.label}</p>
                <p className="mt-2 text-lg font-semibold text-gray-900">{item.value}</p>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <Card className="rounded-3xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Customer Profile</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Customer Code</p>
                  <p className="mt-1 text-sm text-gray-900">{customer.customerCode || 'Not available'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Type</p>
                  <p className="mt-1 text-sm capitalize text-gray-900">{customer.type}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Phone</p>
                  <p className="mt-1 text-sm text-gray-900">{customer.phone || 'Not available'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Email</p>
                  <p className="mt-1 text-sm text-gray-900">{customer.email || 'Not available'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Company Name</p>
                  <p className="mt-1 text-sm text-gray-900">{customer.companyName || 'Not available'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Tax ID</p>
                  <p className="mt-1 text-sm text-gray-900">{customer.taxId || 'Not available'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Credit Limit</p>
                  <p className="mt-1 text-sm text-gray-900">{formatCustomerCurrency(customer.creditLimit)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Status</p>
                  <div className="mt-1">
                    <span className={`inline-flex rounded-md px-3 py-1 capitalize ${getCustomerStatusClassName(customer.status)}`}>
                      {customer.status}
                    </span>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Address</p>
                  <p className="mt-1 text-sm text-gray-900">{getCustomerAddressText(customer.address)}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Notes</p>
                  <p className="mt-1 text-sm text-gray-900">{customer.notes || 'No notes added'}</p>
                </div>
              </div>
            </Card>

            <Card className="rounded-3xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Account Summary</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Outstanding Balance</p>
                  <p className="mt-1 text-sm text-gray-900">{formatCustomerCurrency(summary?.outstandingBalance ?? customer.outstandingBalance)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Most Purchased Product</p>
                  <p className="mt-1 text-sm text-gray-900">{getMostPurchasedProductText(summary?.mostPurchasedProduct)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Created At</p>
                  <p className="mt-1 text-sm text-gray-900">{formatDateTime(customer.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Updated At</p>
                  <p className="mt-1 text-sm text-gray-900">{formatDateTime(customer.updatedAt)}</p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="rounded-3xl border border-gray-200 p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Sales Order History</h2>
              <p className="mt-1 text-sm text-gray-500">Recent sales activity for this customer.</p>
            </div>

            {orders.length === 0 ? (
              <p className="text-sm text-gray-500">No orders found for this customer.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                      <th className="px-4 py-3 font-semibold">Order</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Items</th>
                      <th className="px-4 py-3 font-semibold">Total</th>
                      <th className="px-4 py-3 font-semibold">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {orders.map((order) => (
                      <tr key={order._id || order.id}>
                        <td className="px-4 py-4 font-medium text-gray-900">{order.orderNumber}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-md px-3 py-1 capitalize ${order.status === 'completed' ? 'bg-green-100 text-green-700' : order.status === 'pending' ? 'bg-amber-100 text-amber-700' : order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-sky-100 text-sky-700'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-gray-600">{order.items?.length || 0}</td>
                        <td className="px-4 py-4 text-gray-600">{formatCustomerCurrency(order.totalAmount)}</td>
                        <td className="px-4 py-4 text-gray-600">{formatDateTime(order.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <Pagination className="mt-6" page={ordersMeta.page} totalPages={totalPages} totalItems={ordersMeta.total} loading={loading} perPage={ordersMeta.limit} onPerPageChange={(nextLimit) => setOrdersMeta((current) => ({ ...current, page: 1, limit: nextLimit }))} onPageChange={(nextPage) => setOrdersMeta((current) => ({ ...current, page: nextPage }))} />
          </Card>
        </>
      )}
    </div>
  );
}

export default CustomerDetails;
