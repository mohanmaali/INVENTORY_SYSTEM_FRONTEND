import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Button, Card, CustomerSelect, SupplierSelect } from '../../components/ui';
import usePermissions from '../../hooks/usePermissions';
import {
  getInventoryReport,
  getLowStockReport,
  getOutOfStockReport,
  getSalesReport,
  getPurchasesReport,
} from '../../services/reports';

const inputClasses =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

const toCurrency = value =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

function Reports() {
  const navigate = useNavigate();
  const permissions = usePermissions('reports');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('inventory');
  const [inventoryFilters, setInventoryFilters] = useState({ category: '', supplierId: '' });
  const [stockFilters, setStockFilters] = useState({ category: '', supplierId: '' });
  const [salesFilters, setSalesFilters] = useState({
    groupBy: 'day',
    startDate: '',
    endDate: '',
    customerId: '',
  });
  const [purchaseFilters, setPurchaseFilters] = useState({
    groupBy: 'day',
    startDate: '',
    endDate: '',
    supplierId: '',
  });
  const [inventoryData, setInventoryData] = useState(null);
  const [lowStockData, setLowStockData] = useState(null);
  const [outOfStockData, setOutOfStockData] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [purchaseData, setPurchaseData] = useState(null);
  const defaultInventoryFilters = { category: '', supplierId: '' };
  const defaultStockFilters = { category: '', supplierId: '' };
  const defaultSalesFilters = { groupBy: 'day', startDate: '', endDate: '', customerId: '' };
  const defaultPurchaseFilters = { groupBy: 'day', startDate: '', endDate: '', supplierId: '' };

  const tabs = useMemo(
    () => [
      { id: 'inventory', label: 'Inventory' },
      { id: 'stock', label: 'Stock Alerts' },
      { id: 'sales', label: 'Sales' },
      { id: 'purchases', label: 'Purchases' },
    ],
    []
  );

  const compactParams = params =>
    Object.fromEntries(Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined));

  const loadActiveReport = async () => {
    setLoading(true);
    try {
      if (activeTab === 'inventory') {
        const data = await getInventoryReport(compactParams(inventoryFilters));
        setInventoryData(data);
      } else if (activeTab === 'stock') {
        const params = compactParams(stockFilters);
        const [low, out] = await Promise.all([getLowStockReport(params), getOutOfStockReport(params)]);
        setLowStockData(low);
        setOutOfStockData(out);
      } else if (activeTab === 'sales') {
        const data = await getSalesReport(compactParams(salesFilters));
        setSalesData(data);
      } else if (activeTab === 'purchases') {
        const data = await getPurchasesReport(compactParams(purchaseFilters));
        setPurchaseData(data);
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to load report';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const clearCurrentFilters = async () => {
    setLoading(true);
    try {
      if (activeTab === 'inventory') {
        setInventoryFilters(defaultInventoryFilters);
        const data = await getInventoryReport({});
        setInventoryData(data);
      } else if (activeTab === 'stock') {
        setStockFilters(defaultStockFilters);
        const [low, out] = await Promise.all([getLowStockReport({}), getOutOfStockReport({})]);
        setLowStockData(low);
        setOutOfStockData(out);
      } else if (activeTab === 'sales') {
        setSalesFilters(defaultSalesFilters);
        const data = await getSalesReport({ groupBy: defaultSalesFilters.groupBy });
        setSalesData(data);
      } else if (activeTab === 'purchases') {
        setPurchaseFilters(defaultPurchaseFilters);
        const data = await getPurchasesReport({ groupBy: defaultPurchaseFilters.groupBy });
        setPurchaseData(data);
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to clear filters';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (permissions.loading || !permissions.canRead) return;
    loadActiveReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, permissions.loading, permissions.canRead]);

  if (!permissions.loading && !permissions.canRead) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">No Access</h2>
        <p className="mt-2 text-sm text-gray-600">You do not have permission to view reports.</p>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Reports & Analytics</h1>
        <p className="mt-2 max-w-3xl text-sm text-gray-600">View inventory, stock alerts, sales, and purchase analytics.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            type="button"
            variant={activeTab === tab.id ? 'primary' : 'secondary'}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {activeTab === 'inventory' && (
        <Card className="rounded-3xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-full md:w-64">
              <input
                value={inventoryFilters.category}
                onChange={(event) => setInventoryFilters((current) => ({ ...current, category: event.target.value }))}
                className={inputClasses}
                placeholder="Filter by category"
              />
            </div>
            <div className="w-full md:w-72">
              <SupplierSelect
                value={inventoryFilters.supplierId}
                onChange={(value) => setInventoryFilters((current) => ({ ...current, supplierId: value }))}
                placeholder="Search supplier by name"
              />
            </div>
            <div className="flex items-center gap-2 md:ml-auto">
              <Button type="button" className="px-3 py-1" onClick={loadActiveReport} disabled={loading}>
                {loading ? 'Loading...' : 'Apply Filters'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="px-3 py-1"
                onClick={clearCurrentFilters}
                disabled={loading}
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {inventoryData && (
            <div className="mt-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card className="border border-gray-200 p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Total Products</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{inventoryData.totals?.totalProducts || 0}</p>
                </Card>
                <Card className="border border-gray-200 p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Stock Value</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{toCurrency(inventoryData.totals?.totalStockValue)}</p>
                </Card>
                <Card className="border border-gray-200 p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Active</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{inventoryData.totals?.byStatus?.active || 0}</p>
                </Card>
                <Card className="border border-gray-200 p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Inactive + Discontinued</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {(inventoryData.totals?.byStatus?.inactive || 0) + (inventoryData.totals?.byStatus?.discontinued || 0)}
                  </p>
                </Card>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-800">Top Highest Stock</h3>
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                          <th className="px-4 py-3">Product</th>
                          <th className="px-4 py-3">Qty</th>
                          <th className="px-4 py-3">Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {(inventoryData.topHighestStock || []).map((item) => (
                          <tr key={item._id}>
                            <td className="px-4 py-3 text-gray-800">
                              <button
                                type="button"
                                className="text-primary hover:underline"
                                onClick={() => navigate(`/inventory/${item._id}/edit`)}
                              >
                                {item.name}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-gray-600">{item.quantity}</td>
                            <td className="px-4 py-3 text-gray-600">{toCurrency(item.stockValue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-800">Top Lowest Stock</h3>
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                          <th className="px-4 py-3">Product</th>
                          <th className="px-4 py-3">Qty</th>
                          <th className="px-4 py-3">Threshold</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {(inventoryData.topLowestStock || []).map((item) => (
                          <tr key={item._id}>
                            <td className="px-4 py-3 text-gray-800">
                              <button
                                type="button"
                                className="text-primary hover:underline"
                                onClick={() => navigate(`/inventory/${item._id}/edit`)}
                              >
                                {item.name}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-gray-600">{item.quantity}</td>
                            <td className="px-4 py-3 text-gray-600">{item.lowStockThreshold}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'stock' && (
        <Card className="rounded-3xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-full md:w-64">
              <input
                value={stockFilters.category}
                onChange={(event) => setStockFilters((current) => ({ ...current, category: event.target.value }))}
                className={inputClasses}
                placeholder="Filter by category"
              />
            </div>
            <div className="w-full md:w-72">
              <SupplierSelect
                value={stockFilters.supplierId}
                onChange={(value) => setStockFilters((current) => ({ ...current, supplierId: value }))}
                placeholder="Search supplier by name"
              />
            </div>
            <div className="flex items-center gap-2 md:ml-auto">
              <Button type="button" className="px-3 py-1" onClick={loadActiveReport} disabled={loading}>
                {loading ? 'Loading...' : 'Apply Filters'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="px-3 py-1"
                onClick={clearCurrentFilters}
                disabled={loading}
              >
                Clear Filters
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-800">Low Stock ({lowStockData?.totalCount || 0})</h3>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Qty</th>
                      <th className="px-4 py-3">Threshold</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {(lowStockData?.items || []).map((item) => (
                      <tr key={item._id}>
                        <td className="px-4 py-3 text-gray-800">
                          <button
                            type="button"
                            className="text-primary hover:underline"
                            onClick={() => navigate(`/inventory/${item._id}/edit`)}
                          >
                            {item.name}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{item.quantity}</td>
                        <td className="px-4 py-3 text-gray-600">{item.threshold}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-800">Out of Stock ({outOfStockData?.totalCount || 0})</h3>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">SKU</th>
                      <th className="px-4 py-3">Supplier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {(outOfStockData?.items || []).map((item) => (
                      <tr key={item._id}>
                        <td className="px-4 py-3 text-gray-800">
                          <button
                            type="button"
                            className="text-primary hover:underline"
                            onClick={() => navigate(`/inventory/${item._id}/edit`)}
                          >
                            {item.name}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{item.sku}</td>
                        <td className="px-4 py-3 text-gray-600">{item.supplier?.name || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'sales' && (
        <Card className="rounded-3xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-full md:w-52">
              <select
                className={`${inputClasses} min-h-[42px]`}
                value={salesFilters.groupBy}
                onChange={(event) => setSalesFilters((current) => ({ ...current, groupBy: event.target.value }))}
              >
                <option value="day">Group by day</option>
                <option value="week">Group by week</option>
                <option value="month">Group by month</option>
              </select>
            </div>
            <div className="w-full md:w-44">
              <input type="date" className={inputClasses} value={salesFilters.startDate} onChange={(event) => setSalesFilters((current) => ({ ...current, startDate: event.target.value }))} />
            </div>
            <div className="w-full md:w-44">
              <input type="date" className={inputClasses} value={salesFilters.endDate} onChange={(event) => setSalesFilters((current) => ({ ...current, endDate: event.target.value }))} />
            </div>
            <div className="w-full md:w-80">
              <CustomerSelect
                value={salesFilters.customerId}
                onChange={(value) => setSalesFilters((current) => ({ ...current, customerId: value }))}
                placeholder="Search customer by name/email"
              />
            </div>
            <div className="flex items-center gap-2 md:ml-auto">
              <Button type="button" className="px-3 py-1" onClick={loadActiveReport} disabled={loading}>{loading ? 'Loading...' : 'Apply Filters'}</Button>
              <Button
                type="button"
                variant="secondary"
                className="px-3 py-1"
                onClick={clearCurrentFilters}
                disabled={loading}
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {salesData && (
            <div className="mt-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border border-gray-200 p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Total Orders</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{salesData.totals?.totalOrders || 0}</p>
                </Card>
                <Card className="border border-gray-200 p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Total Revenue</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{toCurrency(salesData.totals?.totalRevenue)}</p>
                </Card>
                <Card className="border border-gray-200 p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Average Order Value</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{toCurrency(salesData.totals?.averageOrderValue)}</p>
                </Card>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-800">Revenue By Period</h3>
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                          <th className="px-4 py-3">Period</th>
                          <th className="px-4 py-3">Orders</th>
                          <th className="px-4 py-3">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {(salesData.revenueByPeriod || []).map((item) => (
                          <tr key={item.period}>
                            <td className="px-4 py-3 text-gray-800">{item.period}</td>
                            <td className="px-4 py-3 text-gray-600">{item.orders}</td>
                            <td className="px-4 py-3 text-gray-600">{toCurrency(item.revenue)}</td>
                          </tr>
                        ))}
                        {(!salesData.revenueByPeriod || salesData.revenueByPeriod.length === 0) && (
                          <tr>
                            <td className="px-4 py-4 text-gray-500" colSpan={3}>
                              No revenue data found for the selected filters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-800">Top Selling Products</h3>
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                          <th className="px-4 py-3">Product</th>
                          <th className="px-4 py-3">Qty Sold</th>
                          <th className="px-4 py-3">Sales</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {(salesData.topProducts || []).map((item) => (
                          <tr key={item._id || item.sku}>
                            <td className="px-4 py-3 text-gray-800">
                              {item._id ? (
                                <button
                                  type="button"
                                  className="text-primary hover:underline"
                                  onClick={() => navigate(`/inventory/${item._id}/edit`)}
                                >
                                  {item.name || item.sku || '-'}
                                </button>
                              ) : (
                                item.name || item.sku || '-'
                              )}
                            </td>
                            <td className="px-4 py-3 text-gray-600">{item.totalQuantitySold}</td>
                            <td className="px-4 py-3 text-gray-600">{toCurrency(item.totalSalesValue)}</td>
                          </tr>
                        ))}
                        {(!salesData.topProducts || salesData.topProducts.length === 0) && (
                          <tr>
                            <td className="px-4 py-4 text-gray-500" colSpan={3}>
                              No top-selling products found for the selected filters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-800">Top Customers</h3>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3">Orders</th>
                        <th className="px-4 py-3">Spend</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {(salesData.topCustomers || []).map((item) => (
                        <tr key={item._id || item.customerCode}>
                          <td className="px-4 py-3 text-gray-800">
                            {item._id ? (
                              <button
                                type="button"
                                className="text-primary hover:underline"
                                onClick={() => navigate(`/customers/${item._id}`)}
                              >
                                {item.name || item.customerCode || '-'}
                              </button>
                            ) : (
                              item.name || item.customerCode || '-'
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-600">{item.totalOrders}</td>
                          <td className="px-4 py-3 text-gray-600">{toCurrency(item.totalSpend)}</td>
                        </tr>
                      ))}
                      {(!salesData.topCustomers || salesData.topCustomers.length === 0) && (
                        <tr>
                          <td className="px-4 py-4 text-gray-500" colSpan={3}>
                            No top customers found for the selected filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'purchases' && (
        <Card className="rounded-3xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-full md:w-52">
              <select
                className={`${inputClasses} min-h-[42px]`}
                value={purchaseFilters.groupBy}
                onChange={(event) => setPurchaseFilters((current) => ({ ...current, groupBy: event.target.value }))}
              >
                <option value="day">Group by day</option>
                <option value="week">Group by week</option>
                <option value="month">Group by month</option>
              </select>
            </div>
            <div className="w-full md:w-44">
              <input type="date" className={inputClasses} value={purchaseFilters.startDate} onChange={(event) => setPurchaseFilters((current) => ({ ...current, startDate: event.target.value }))} />
            </div>
            <div className="w-full md:w-44">
              <input type="date" className={inputClasses} value={purchaseFilters.endDate} onChange={(event) => setPurchaseFilters((current) => ({ ...current, endDate: event.target.value }))} />
            </div>
            <div className="w-full md:w-80">
              <SupplierSelect
                value={purchaseFilters.supplierId}
                onChange={(value) => setPurchaseFilters((current) => ({ ...current, supplierId: value }))}
                placeholder="Search supplier by name"
              />
            </div>
            <div className="flex items-center gap-2 md:ml-auto">
              <Button type="button" className="px-3 py-1" onClick={loadActiveReport} disabled={loading}>{loading ? 'Loading...' : 'Apply Filters'}</Button>
              <Button
                type="button"
                variant="secondary"
                className="px-3 py-1"
                onClick={clearCurrentFilters}
                disabled={loading}
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {purchaseData && (
            <div className="mt-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border border-gray-200 p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Total Purchase Orders</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{purchaseData.totals?.totalOrders || 0}</p>
                </Card>
                <Card className="border border-gray-200 p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Total Spent</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{toCurrency(purchaseData.totals?.totalSpent)}</p>
                </Card>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-800">Spend By Period</h3>
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                          <th className="px-4 py-3">Period</th>
                          <th className="px-4 py-3">Orders</th>
                          <th className="px-4 py-3">Spend</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {(purchaseData.spendByPeriod || []).map((item) => (
                          <tr key={item.period}>
                            <td className="px-4 py-3 text-gray-800">{item.period}</td>
                            <td className="px-4 py-3 text-gray-600">{item.orders}</td>
                            <td className="px-4 py-3 text-gray-600">{toCurrency(item.spend)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-800">Top Suppliers</h3>
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                          <th className="px-4 py-3">Supplier</th>
                          <th className="px-4 py-3">Orders</th>
                          <th className="px-4 py-3">Spend</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {(purchaseData.topSuppliers || []).map((item) => (
                          <tr key={item._id || item.name}>
                            <td className="px-4 py-3 text-gray-800">
                              {item._id ? (
                                <button
                                  type="button"
                                  className="text-primary hover:underline"
                                  onClick={() => navigate(`/purchase/suppliers/${item._id}/edit`)}
                                >
                                  {item.name || '-'}
                                </button>
                              ) : (
                                item.name || '-'
                              )}
                            </td>
                            <td className="px-4 py-3 text-gray-600">{item.totalOrders}</td>
                            <td className="px-4 py-3 text-gray-600">{toCurrency(item.totalSpend)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

export default Reports;
