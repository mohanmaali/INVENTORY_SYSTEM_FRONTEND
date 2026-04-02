import { FaBoxes, FaExclamationTriangle, FaShoppingCart, FaDollarSign, FaFileInvoiceDollar } from 'react-icons/fa';
import { Card, Table } from '../../components/ui';

// Keep core metrics concise for clearer layout
const metrics = [
  { id: 1, label: 'Total Items', value: '1,234', icon: FaBoxes, color: 'text-primary-600' },
  { id: 2, label: 'Low Stock', value: '42', icon: FaExclamationTriangle, color: 'text-yellow-500' },
  { id: 3, label: 'Sales Today', value: '128', icon: FaShoppingCart, color: 'text-green-600' },
  { id: 4, label: 'Revenue', value: '$4,560', icon: FaDollarSign, color: 'text-indigo-600' },
];

const recent = [
  { id: 'TXN-001', item: 'Red T-Shirt', qty: 3, total: '$45' },
  { id: 'TXN-002', item: 'Blue Jeans', qty: 1, total: '$60' },
  { id: 'TXN-003', item: 'Sneakers', qty: 2, total: '$120' },
];

function Dashboard() {
  const columns = [
    { key: 'id', title: 'ID' },
    { key: 'item', title: 'Item' },
    { key: 'qty', title: 'Qty' },
    { key: 'total', title: 'Total' },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of recent activity</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-3 py-2 bg-primary text-white rounded-md">Add Item</button>
        </div>
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
          <Table columns={columns} data={recent} />
        </Card>

        <Card>
          <h2 className="text-lg font-medium mb-3">Quick Actions</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div>Create a new purchase order</div>
            <div>View low stock items</div>
            <div>Generate sales report</div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
