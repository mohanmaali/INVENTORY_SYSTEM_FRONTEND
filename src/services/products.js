import api from './api';

export async function createProduct(data) {
  const res = await api.post('/products', data);
  return res.data?.data ?? res.data;
}

export async function getProducts(params = {}) {
  const res = await api.get('/products', { params });
  return res.data;
}

export async function getProductById(id) {
  const res = await api.get(`/products/${id}`);
  return res.data?.data ?? res.data;
}

export async function updateProduct(id, data) {
  const res = await api.patch(`/products/${id}`, data);
  return res.data?.data ?? res.data;
}

export async function deleteProduct(id, options = {}) {
  const { deleteStockLogs = true } = options;
  await api.delete(`/products/${id}/permanent`, {
    params: deleteStockLogs ? { deleteStockLogs: true } : undefined,
  });
}

export async function adjustProductStock(id, data) {
  const res = await api.patch(`/products/${id}/stock`, data);
  return res.data?.data ?? res.data;
}

export async function getProductStockHistory(id, params = {}) {
  const res = await api.get(`/products/${id}/stock/history`, { params });
  return res.data;
}

export default {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  adjustProductStock,
  getProductStockHistory,
};
