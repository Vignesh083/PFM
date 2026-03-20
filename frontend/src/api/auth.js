import axios from 'axios';

const BASE = 'http://localhost:9006/api/auth';

export const login = (username, password) =>
  axios.post(`${BASE}/login`, { username, password });

export const register = (username, password) =>
  axios.post(`${BASE}/register`, { username, password });
