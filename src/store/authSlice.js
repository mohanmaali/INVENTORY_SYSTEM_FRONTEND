import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../services/api';
import * as authService from '../services/auth';

const applyToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    api.defaults.headers.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete api.defaults.headers.Authorization;
  }
};

export const initializeAuth = createAsyncThunk(
  'auth/initializeAuth',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('token');

    if (!token) {
      return { user: null, token: null };
    }

    applyToken(token);

    try {
      const res = await api.get('/auth/profile');
      const profileUser = res?.data?.data ?? res?.data?.user ?? res?.data;
      return { user: profileUser || null, token };
    } catch (error) {
      applyToken(null);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await authService.login(credentials);
      const token = data?.token ?? null;

      applyToken(token);

      const res = await api.get('/auth/profile');
      const profileUser = res?.data?.data ?? res?.data?.user ?? res?.data;

      return { user: profileUser || null, token };
    } catch (error) {
      applyToken(null);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await authService.register(credentials);
      const token = data?.token ?? null;

      applyToken(token);

      const res = await api.get('/auth/profile');
      const profileUser = res?.data?.data ?? res?.data?.user ?? res?.data;

      return { user: profileUser || null, token };
    } catch (error) {
      applyToken(null);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  loading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload ?? null;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.loading = false;
      applyToken(null);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.loading = false;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.loading = false;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.loading = false;
      })
      .addCase(loginUser.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.loading = false;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.loading = false;
      });
  },
});

export const { setUser, logout } = authSlice.actions;

export default authSlice.reducer;
