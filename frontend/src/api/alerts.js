import axiosClient from './axiosClient';

export const getUnreadCount = () => axiosClient.get('/api/alerts/unread/count');
export const getAlerts = () => axiosClient.get('/api/alerts');
export const markRead = (id) => axiosClient.put(`/api/alerts/${id}/read`);
export const markAllRead = () => axiosClient.put('/api/alerts/read-all');
