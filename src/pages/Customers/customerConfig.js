import { formatDateTime } from '../../utils/formatDate';

export const CUSTOMER_TYPES = ['individual', 'business'];
export const CUSTOMER_STATUS_OPTIONS = ['active', 'inactive', 'blacklisted'];

export const CUSTOMER_STATUS_STYLES = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-700',
  blacklisted: 'bg-red-100 text-red-700',
};

export const initialCustomerForm = {
  name: '',
  type: 'individual',
  email: '',
  phone: '',
  companyName: '',
  taxId: '',
  creditLimit: '',
  status: 'active',
  notes: '',
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  },
};

export const customerInputClasses =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

export const getCustomerStatusClassName = (status) =>
  CUSTOMER_STATUS_STYLES[status] || 'bg-gray-100 text-gray-700';

export const formatCustomerCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

export const getCustomerAddressText = (address) => {
  if (!address) return 'No address';
  const parts = [address.street, address.city, address.state, address.zipCode, address.country].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'No address';
};

export const getCustomerSummaryCards = (summary) => [
  { label: 'Total Orders', value: summary?.totalOrders ?? 0 },
  { label: 'Total Spend', value: formatCustomerCurrency(summary?.totalSpend ?? 0) },
  {
    label: 'Outstanding Balance',
    value: formatCustomerCurrency(summary?.outstandingBalance ?? 0),
  },
  {
    label: 'Last Order',
    value: summary?.lastOrderDate ? formatDateTime(summary.lastOrderDate) : 'No orders yet',
  },
];
