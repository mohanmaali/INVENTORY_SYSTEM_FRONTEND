export const PRODUCT_STATUS_OPTIONS = ['active', 'inactive', 'discontinued'];

export const STOCK_ADJUSTMENT_TYPES = ['restock', 'adjustment', 'return'];

export const PRODUCT_STATUS_STYLES = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-amber-100 text-amber-700',
  discontinued: 'bg-red-100 text-red-700',
};

export const initialProductForm = {
  name: '',
  sku: '',
  price: '',
  quantity: '',
  supplier: '',
  category: '',
  unit: '',
  lowStockThreshold: '10',
  status: 'active',
};

export const formatCurrency = (value) => {
  const amount = Number(value || 0);

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
};

export const getProductStatusClassName = (status) =>
  PRODUCT_STATUS_STYLES[status] || 'bg-gray-100 text-gray-700';
