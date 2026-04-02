import Dashboard from '../pages/Dashboard/Dashboard';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import NotFound from '../pages/NotFound/NotFound';
import Inventory from '../pages/Inventory/Inventory';
import Sales from '../pages/Sales/Sales';
import Purchase from '../pages/Purchase/Purchase';
import Reports from '../pages/Reports/Reports';
import ListRoles from '../pages/Permission/ListRoles';
import AddRole from '../pages/Permission/AddRole';
import EditRole from '../pages/Permission/EditRole';
import AddUser from '../pages/Users/AddUser';
import ListUsers from '../pages/Users/ListUsers';
import EditUser from '../pages/Users/EditUser';
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
    element: <Layout><Inventory /></Layout>,
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
