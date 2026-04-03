import Dashboard from '../pages/Dashboard/Dashboard';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import NotFound from '../pages/NotFound/NotFound';
import ListProducts from '../pages/Products/ListProducts';
import AddProduct from '../pages/Products/AddProduct';
import EditProduct from '../pages/Products/EditProduct';
import ProductDetails from '../pages/Products/ProductDetails';
import Sales from '../pages/Sales/Sales';
import Purchase from '../pages/Purchase/Purchase';
import OrderFormPage from '../pages/Orders/components/OrderFormPage';
import OrderDetailsPage from '../pages/Orders/components/OrderDetailsPage';
import Reports from '../pages/Reports/Reports';
import ListRoles from '../pages/Permission/ListRoles';
import AddRole from '../pages/Permission/AddRole';
import EditRole from '../pages/Permission/EditRole';
import AddUser from '../pages/Users/AddUser';
import ListUsers from '../pages/Users/ListUsers';
import EditUser from '../pages/Users/EditUser';
import ListSuppliers from '../pages/Suppliers/ListSuppliers';
import AddSupplier from '../pages/Suppliers/AddSupplier';
import EditSupplier from '../pages/Suppliers/EditSupplier';
import ListCustomers from '../pages/Customers/ListCustomers';
import AddCustomer from '../pages/Customers/AddCustomer';
import EditCustomer from '../pages/Customers/EditCustomer';
import CustomerDetails from '../pages/Customers/CustomerDetails';
import Layout from '../components/common/Layout';

export const routes = [
  {
    path: '/',
    element: <Layout><Dashboard /></Layout>,
    protected: false,
  },
  {
    path: '/login',
    element: <Login />,
    protected: false,
  },
  {
    path: '/register',
    element: <Register />,
    protected: false,
  },
  {
    path: '/inventory',
    element: <Layout><ListProducts /></Layout>,
    protected: false,
  },
  {
    path: '/inventory/add',
    element: <Layout><AddProduct /></Layout>,
    protected: false,
  },
  {
    path: '/inventory/:id/edit',
    element: <Layout><EditProduct /></Layout>,
    protected: false,
  },
  {
    path: '/inventory/:id',
    element: <Layout><ProductDetails /></Layout>,
    protected: false,
  },
  {
    path: '/sales',
    element: <Layout><Sales /></Layout>,
    protected: false,
  },
  {
    path: '/purchase',
    element: <Layout><Purchase /></Layout>,
    protected: false,
  },
  {
    path: '/orders/purchase',
    element: <Layout><Purchase /></Layout>,
    protected: false,
  },
  {
    path: '/orders/purchase/add',
    element: <Layout><OrderFormPage type="purchase" /></Layout>,
    protected: false,
  },
  {
    path: '/orders/purchase/:id',
    element: <Layout><OrderDetailsPage type="purchase" /></Layout>,
    protected: false,
  },
  {
    path: '/orders/purchase/:id/edit',
    element: <Layout><OrderFormPage type="purchase" mode="edit" /></Layout>,
    protected: false,
  },
  {
    path: '/orders/sales',
    element: <Layout><Sales /></Layout>,
    protected: false,
  },
  {
    path: '/orders/sales/add',
    element: <Layout><OrderFormPage type="sale" /></Layout>,
    protected: false,
  },
  {
    path: '/orders/sales/:id',
    element: <Layout><OrderDetailsPage type="sale" /></Layout>,
    protected: false,
  },
  {
    path: '/orders/sales/:id/edit',
    element: <Layout><OrderFormPage type="sale" mode="edit" /></Layout>,
    protected: false,
  },
  {
    path: '/purchase/suppliers',
    element: <Layout><ListSuppliers /></Layout>,
    protected: false,
  },
  {
    path: '/purchase/suppliers/add',
    element: <Layout><AddSupplier /></Layout>,
    protected: false,
  },
  {
    path: '/purchase/suppliers/:id/edit',
    element: <Layout><EditSupplier /></Layout>,
    protected: false,
  },
  {
    path: '/customers',
    element: <Layout><ListCustomers /></Layout>,
    protected: false,
  },
  {
    path: '/customers/add',
    element: <Layout><AddCustomer /></Layout>,
    protected: false,
  },
  {
    path: '/customers/:id',
    element: <Layout><CustomerDetails /></Layout>,
    protected: false,
  },
  {
    path: '/customers/:id/edit',
    element: <Layout><EditCustomer /></Layout>,
    protected: false,
  },
  {
    path: '/reports',
    element: <Layout><Reports /></Layout>,
    protected: false,
  },
  {
    path: '/roles',
    element: <Layout><ListRoles /></Layout>,
    protected: false,
  },
  {
    path: '/roles/add',
    element: <Layout><AddRole /></Layout>,
    protected: false,
  },
  {
    path: '/roles/:id/edit',
    element: <Layout><EditRole /></Layout>,
    protected: false,
  },
  {
    path: '/users',
    element: <Layout><ListUsers /></Layout>,
    protected: false,
  },
  {
    path: '/users/add',
    element: <Layout><AddUser /></Layout>,
    protected: false,
  },
  {
    path: '/users/:id/edit',
    element: <Layout><EditUser /></Layout>,
    protected: false,
  },
  {
    path: '*',
    element: <Layout><NotFound /></Layout>,
    protected: false,
  },
];
