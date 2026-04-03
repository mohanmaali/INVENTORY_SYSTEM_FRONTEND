import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  initializeAuth,
  loginUser,
  logout,
  registerUser,
  setUser,
} from '../store/authSlice';

export function useInitializeAuth() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);
}

export function useAuth() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  return useMemo(
    () => ({
      user,
      loading,
      async login(credentials) {
        return dispatch(loginUser(credentials)).unwrap();
      },
      async register(credentials) {
        return dispatch(registerUser(credentials)).unwrap();
      },
      logout() {
        dispatch(logout());
      },
      setUser(nextUser) {
        dispatch(setUser(nextUser));
      },
    }),
    [dispatch, loading, user]
  );
}

export default useAuth;
