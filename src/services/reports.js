import api from './api';

export async function getInventoryReport(params = {}) {
  const res = await api.get('/reports/inventory', { params });
  return res.data?.data ?? res.data;
}

export async function getLowStockReport(params = {}) {
  const res = await api.get('/reports/low-stock', { params });
  return res.data?.data ?? res.data;
}

export async function getOutOfStockReport(params = {}) {
  const res = await api.get('/reports/out-of-stock', { params });
  return res.data?.data ?? res.data;
}

export async function getSalesReport(params = {}) {
  const res = await api.get('/reports/sales', { params });
  return res.data?.data ?? res.data;
}

export async function getPurchasesReport(params = {}) {
  const res = await api.get('/reports/purchases', { params });
  return res.data?.data ?? res.data;
}

export async function getDashboardReport() {
  const res = await api.get('/reports/dashboard');
  return res.data?.data ?? res.data;
}

export default {
  getInventoryReport,
  getLowStockReport,
  getOutOfStockReport,
  getSalesReport,
  getPurchasesReport,
  getDashboardReport,
};
