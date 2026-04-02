import api from './api';

export async function createRole(data) {
  const res = await api.post('/roles', data);
  return res.data?.data ?? res.data;
}

export async function getRoles() {
  const res = await api.get('/roles');
  return res.data?.data ?? res.data;
}

export async function getRoleById(id) {
  const res = await api.get(`/roles/${id}`);
  return res.data?.data ?? res.data;
}

export async function updateRole(id, data) {
  const res = await api.patch(`/roles/${id}`, data);
  return res.data?.data ?? res.data;
}

export async function deleteRole(id) {
  await api.delete(`/roles/${id}`);
}

export default {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
};
