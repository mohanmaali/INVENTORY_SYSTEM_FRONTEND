import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaBoxes, FaShoppingCart, FaFileInvoiceDollar, FaChartBar, FaUserShield, FaPlus, FaList } from 'react-icons/fa';
import SidebarGroup from './SidebarGroup';

function Sidebar({ mobileOpen, onClose }) {
  const groups = [
    {
      title: 'Inventory',
      items: [
        { to: '/inventory/add', label: 'Add Item', icon: FaPlus },
        { to: '/inventory', label: 'View Items', icon: FaList },
      ],
    },
    {
      title: 'Sales',
      items: [
        { to: '/sales', label: 'Orders', icon: FaShoppingCart },
        { to: '/sales/customers', label: 'Customers', icon: FaUserShield },
      ],
    },
    {
      title: 'Purchase',
      items: [
        { to: '/purchase', label: 'Orders', icon: FaFileInvoiceDollar },
      ],
    },
    {
      title: 'Suppliers',
      items: [
        { to: '/purchase/suppliers/add', label: 'Add Supplier', icon: FaPlus },
        { to: '/purchase/suppliers', label: 'Supplier List', icon: FaUserShield },
      ],
    },
    {
      title: 'Reports',
      items: [
        { to: '/reports', label: 'Reports', icon: FaChartBar },
      ],
    },
    {
      title: 'Settings',
      items: [
        { to: '/roles', label: 'Role List', icon: FaUserShield },
        { to: '/roles/add', label: 'Add Role', icon: FaPlus },
      ],
    },
    {
      title: 'Users',
      items: [
        { to: '/users/add', label: 'Add User', icon: FaPlus },
        { to: '/users', label: 'User List', icon: FaList },
      ],
    },
  ];
  return (
    // Desktop sidebar
    <>
      <aside className="w-64 bg-white border-r hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-5 border-b">
          <div className="text-xl font-semibold text-primary-600">Inventory</div>
        </div>
        <nav className="p-4 flex-1 overflow-y-auto">
          <ul className="space-y-4">
            <li>
              <NavLink to="/" end className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 ${isActive ? 'bg-gray-100 font-semibold text-gray-900 border-l-4 border-primary-500' : ''}`}>
                <FaTachometerAlt className="w-4 h-4 text-primary-600" />
                <span>Dashboard</span>
              </NavLink>
            </li>
            {groups.map((g) => (
              <li key={g.title}>
                <SidebarGroup title={g.title} items={g.items} />
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t pro-subtle text-sm">v0.1.0</div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="fixed inset-0 bg-black/40" onClick={onClose} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white border-r p-0">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="text-lg font-semibold text-primary-600">Inventory</div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-md">Close</button>
            </div>
            <nav className="p-4 overflow-y-auto">
              <ul className="space-y-4">
                <li>
                  <NavLink onClick={onClose} to="/" end className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 ${isActive ? 'bg-gray-100 font-semibold text-gray-900 border-l-4 border-primary-500' : ''}`}>
                    <FaTachometerAlt className="w-4 h-4 text-primary-600" />
                    <span>Dashboard</span>
                  </NavLink>
                </li>
                {groups.map((g) => (
                  <li key={g.title}>
                    <SidebarGroup title={g.title} items={g.items.map(it => ({...it, to: it.to}))} />
                  </li>
                ))}
              </ul>
            </nav>
            <div className="p-4 border-t pro-subtle text-sm">v0.1.0</div>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
