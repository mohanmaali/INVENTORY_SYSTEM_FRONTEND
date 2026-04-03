import api from './api';

export async function getCustomers(params = {}) {
  const res = await api.get('/customers', { params });
  return res.data;
}

export async function getCustomerById(id) {
  const res = await api.get(`/customers/${id}`);
  return res.data?.data ?? res.data;
}

export async function createCustomer(data) {
  const res = await api.post('/customers', data);
  return res.data?.data ?? res.data;
}

export async function updateCustomer(id, data) {
  const res = await api.patch(`/customers/${id}`, data);
  return res.data?.data ?? res.data;
}

export async function deleteCustomer(id) {
  await api.delete(`/customers/${id}`);
}

export async function permanentlyDeleteCustomer(id) {
  await api.delete(`/customers/${id}/permanent`);
}

export async function getCustomerOrders(id, params = {}) {
  const res = await api.get(`/customers/${id}/orders`, { params });
  return res.data?.data ?? res.data;
}

export async function getCustomerSummary(id) {
  const res = await api.get(`/customers/${id}/summary`);
  return res.data?.data ?? res.data;
}

export default {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  permanentlyDeleteCustomer,
  getCustomerOrders,
  getCustomerSummary,
};
