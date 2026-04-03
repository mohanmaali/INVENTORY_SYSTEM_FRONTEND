import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBoxes, FaExclamationTriangle, FaShoppingCart, FaDollarSign } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { Button, Card } from '../../components/ui';
import { getDashboardReport, getLowStockReport } from '../../services/reports';

const toCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [report, lowStock] = await Promise.all([
          getDashboardReport(),
          getLowStockReport(),
        ]);
        setData(report);
        setLowStockItems((lowStock?.items || []).slice(0, 5));
      } catch (err) {
        const message = err.response?.data?.message || err.message || 'Failed to load dashboard summary';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const metrics = useMemo(
    () => [
      { id: 1, label: 'Active Products', value: data?.totalProducts ?? 0, icon: FaBoxes, color: 'text-primary-600' },
      { id: 2, label: 'Low Stock Items', value: data?.lowStockCount ?? 0, icon: FaExclamationTriangle, color: 'text-yellow-500' },
      { id: 3, label: 'Sales Today', value: data?.salesToday?.count ?? 0, icon: FaShoppingCart, color: 'text-green-600' },
      { id: 4, label: 'Stock Value', value: toCurrency(data?.totalStockValue), icon: FaDollarSign, color: 'text-indigo-600' },
    ],
    [data]
  );

  const recent = useMemo(() => data?.recentOrders || [], [data]);

  const openOrderDetails = (order) => {
    const orderId = order?._id || order?.id;
    if (!orderId) return;
    const basePath = order.type === 'purchase' ? '/orders/purchase' : '/orders/sales';
    navigate(`${basePath}/${orderId}`);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of live business activity</p>
        </div>
        {loading && <div className="text-sm text-gray-500">Loading...</div>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.id} className="flex items-center gap-6 p-6">
              <div className="p-4 rounded-md bg-primary-50 flex items-center justify-center">
                <Icon className={`w-8 h-8 ${m.color}`} />
              </div>
              <div>
                <div className="text-sm text-gray-500">{m.label}</div>
                <div className="text-2xl font-semibold">{m.value}</div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-medium mb-3">Recent Transactions</h2>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {recent.map((order) => (
                  <tr
                    key={order._id || order.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => openOrderDetails(order)}
                  >
                    <td className="px-4 py-3 font-medium text-primary">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-700">{order.type}</td>
                    <td className="px-4 py-3 capitalize text-gray-700">{order.status}</td>
                    <td className="px-4 py-3 text-gray-700">{toCurrency(order.totalAmount)}</td>
                  </tr>
                ))}
                {recent.length === 0 && (
                  <tr>
                    <td className="px-4 py-4 text-gray-500" colSpan={4}>
                      No recent orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-medium mb-3">Today Snapshot</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div>Sales count: {data?.salesToday?.count ?? 0}</div>
            <div>Sales revenue: {toCurrency(data?.salesToday?.revenue)}</div>
            <div>Purchases count: {data?.purchasesToday?.count ?? 0}</div>
            <div>Purchases spend: {toCurrency(data?.purchasesToday?.spend)}</div>
            <div>
              Top product this month: {data?.topSellingProduct?.name || 'Not available'}
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-medium">Low Stock Action List</h2>
            <Button type="button" variant="secondary" onClick={() => navigate('/reports')}>
              View Full Report
            </Button>
          </div>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Threshold</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {lowStockItems.map((item) => (
                  <tr key={item._id}>
                    <td className="px-4 py-3 text-gray-800">{item.name}</td>
                    <td className="px-4 py-3 text-gray-700">{item.sku || '-'}</td>
                    <td className="px-4 py-3 text-gray-700">{item.quantity}</td>
                    <td className="px-4 py-3 text-gray-700">{item.threshold}</td>
                    <td className="px-4 py-3">
                      <Button
                        type="button"
                        variant="ghost"
                        className="px-2 py-1 text-primary"
                        onClick={() => navigate(`/inventory/${item._id}/edit`)}
                      >
                        Update Stock
                      </Button>
                    </td>
                  </tr>
                ))}
                {lowStockItems.length === 0 && (
                  <tr>
                    <td className="px-4 py-4 text-gray-500" colSpan={5}>
                      No low stock items right now.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
