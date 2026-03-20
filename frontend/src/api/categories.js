import axiosClient from './axiosClient';

export const getCategories = () => axiosClient.get('/api/categories');
export const createCategory = (data) => axiosClient.post('/api/categories', data);
export const updateCategory = (id, data) => axiosClient.put(`/api/categories/${id}`, data);
export const deleteCategory = (id) => axiosClient.delete(`/api/categories/${id}`);
