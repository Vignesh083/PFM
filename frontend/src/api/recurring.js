import axiosClient from './axiosClient';

export const getRecurring = () => axiosClient.get('/api/recurring');
export const createRecurring = (data) => axiosClient.post('/api/recurring', data);
export const toggleRecurring = (id) => axiosClient.put(`/api/recurring/${id}/toggle`);
export const deleteRecurring = (id) => axiosClient.delete(`/api/recurring/${id}`);
