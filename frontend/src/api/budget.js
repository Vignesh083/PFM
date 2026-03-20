import axiosClient from './axiosClient';

export const getBudgetProfile = () => axiosClient.get('/api/budget/profile');
export const saveBudgetProfile = (data) => axiosClient.put('/api/budget/profile', data);
export const getCategoryBudgets = () => axiosClient.get('/api/budget/categories');
export const setCategoryBudget = (categoryId, limit) =>
  axiosClient.put(`/api/budget/categories/${categoryId}`, null, { params: { limit } });
export const deleteCategoryBudget = (categoryId) =>
  axiosClient.delete(`/api/budget/categories/${categoryId}`);
export const getBudgetComparison = (month) =>
  axiosClient.get('/api/budget/comparison', { params: { month } });
