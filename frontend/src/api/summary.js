import axiosClient from './axiosClient';

export const getDailySummary = (date) =>
  axiosClient.get('/api/summary/daily', { params: { date } });

export const getMonthlySummary = (month) =>
  axiosClient.get('/api/summary/monthly', { params: { month } });

export const getYearlySummary = (year) =>
  axiosClient.get('/api/summary/yearly', { params: { year } });
