import api from './api';

export async function register(data) {
  const res = await api.post('/auth/register', data);
  return res.data.data;
}

export async function login(data) {
  
  const res = await api.post('/auth/login', data);
  return res.data?.data // Handle both { data: { token } } and { token }
}

export default { register, login };
