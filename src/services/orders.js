import api from './api';

export async function getOrders(params = {}) {
  const res = await api.get('/orders', { params });
  return res.data;
}

export async function getOrderById(id) {
  const res = await api.get(`/orders/${id}`);
  return res.data?.data ?? res.data;
}

export async function getOrderTimeline(id) {
  const res = await api.get(`/orders/${id}/timeline`);
  return res.data?.data ?? res.data;
}

export async function getOrderSummary(params = {}) {
  const res = await api.get('/orders/summary', { params });
  return res.data?.data ?? res.data;
}

export async function createOrder(data) {
  const res = await api.post('/orders', data);
  return res.data?.data ?? res.data;
}

export async function updateOrder(id, data) {
  const res = await api.patch(`/orders/${id}`, data);
  return res.data?.data ?? res.data;
}

export async function updateOrderStatus(id, data) {
  const res = await api.patch(`/orders/${id}/status`, data);
  return res.data?.data ?? res.data;
}

export async function deleteOrder(id) {
  await api.delete(`/orders/${id}`);
}

export async function permanentlyDeleteOrder(id) {
  await api.delete(`/orders/${id}/permanent`);
}

export default {
  getOrders,
  getOrderById,
  getOrderTimeline,
  getOrderSummary,
  createOrder,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
  permanentlyDeleteOrder,
};
