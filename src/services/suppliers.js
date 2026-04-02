import api from './api';

export async function getSuppliers(params = {}) {
  const res = await api.get('/suppliers', { params });
  return res.data;
}

export async function getSupplierById(id) {
  const res = await api.get(`/suppliers/${id}`);
  return res.data?.data ?? res.data;
}

export async function createSupplier(data) {
  const res = await api.post('/suppliers', data);
  return res.data?.data ?? res.data;
}

export async function updateSupplier(id, data) {
  const res = await api.put(`/suppliers/${id}`, data);
  return res.data?.data ?? res.data;
}

export async function deleteSupplier(id) {
  await api.delete(`/suppliers/${id}`);
}

export default {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};
