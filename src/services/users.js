import api from './api';

export async function getUsers(params = {}) {
  const res = await api.get('/users', { params });
  return res.data;
}

export async function getUserById(id) {
  const res = await api.get(`/users/${id}`);
  return res.data?.data ?? res.data;
}

export async function updateUser(id, data) {
  const res = await api.put(`/users/${id}`, data);
  return res.data?.data ?? res.data;
}

export async function deleteUser(id) {
  await api.delete(`/users/${id}`);
}

export async function updateUserRole(id, roleId) {
  const res = await api.patch(`/users/${id}/role`, { roleId });
  return res.data?.data ?? res.data;
}

export default {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserRole,
};
