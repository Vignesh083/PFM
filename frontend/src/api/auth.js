import axiosClient from './axiosClient';

export const login = (username, password) =>
  axiosClient.post('/api/auth/login', { username, password });

export const register = (username, password) =>
  axiosClient.post('/api/auth/register', { username, password });
