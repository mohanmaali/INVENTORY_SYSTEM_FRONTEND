export const ORDER_TYPES = ['purchase', 'sale'];

export const ORDER_STATUS_OPTIONS = [
  'pending',
  'confirmed',
  'processing',
  'completed',
  'cancelled',
];

export const ORDER_STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-sky-100 text-sky-700',
  processing: 'bg-indigo-100 text-indigo-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export const inputClasses =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

export const getOrderTypeLabel = (type) =>
  type === 'purchase' ? 'Purchase Order' : 'Sales Order';

export const getOrderStatusClassName = (status) =>
  ORDER_STATUS_STYLES[status] || 'bg-gray-100 text-gray-700';

export const formatOrderCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

export const getPartnerLabel = (type) =>
  type === 'purchase' ? 'Supplier' : 'Customer';

export const getAvailableStatusOptions = (order) => {
  if (!order?.status || !order?.type) return [];

  if (order.type === 'purchase') {
    if (order.status === 'pending') return ['confirmed', 'cancelled'];
    if (order.status === 'confirmed') return ['completed', 'cancelled'];
    return [];
  }

  if (order.status === 'pending') return ['confirmed', 'cancelled'];
  if (order.status === 'confirmed') return ['processing', 'cancelled'];
  if (order.status === 'processing') return ['completed'];

  return [];
};
