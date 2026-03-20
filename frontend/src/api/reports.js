import axiosClient from './axiosClient';

export const getMonthlyReport = (month) =>
  axiosClient.get('/api/reports/monthly', { params: { month } });

export const downloadCSV = (month) =>
  axiosClient.get('/api/reports/monthly/csv', { params: { month }, responseType: 'blob' });
