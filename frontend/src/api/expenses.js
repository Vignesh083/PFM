import axiosClient from './axiosClient';

export const getExpenses = (month, categoryId, search) =>
  axiosClient.get('/api/expenses', { params: { month, categoryId, search } });

export const createExpense = (data) => axiosClient.post('/api/expenses', data);
export const updateExpense = (id, data) => axiosClient.put(`/api/expenses/${id}`, data);
export const deleteExpense = (id) => axiosClient.delete(`/api/expenses/${id}`);
