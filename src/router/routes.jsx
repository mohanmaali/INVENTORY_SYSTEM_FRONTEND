import Dashboard from '../pages/Dashboard/Dashboard';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import NotFound from '../pages/NotFound/NotFound';
import Inventory from '../pages/Inventory/Inventory';
import Sales from '../pages/Sales/Sales';
import Purchase from '../pages/Purchase/Purchase';
import Reports from '../pages/Reports/Reports';
import Permission from '../pages/Permission/Permission';
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
    path: '/permission',
    element: <Layout><Permission /></Layout>,
    protected: false,
  },
  {
    path: '*',
    element: <Layout><NotFound /></Layout>,
    protected: false,
  },
];
