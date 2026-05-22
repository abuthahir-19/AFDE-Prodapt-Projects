import api from '../api';

export const getIssueCategories = async () => {
  const response = await api.get('/analytics/issue-categories');
  return response.data;
};

export const getResolutionTrends = async () => {
  const response = await api.get('/analytics/resolution-trends');
  return response.data;
};

export const getPriorityDistribution = async () => {
  const response = await api.get('/analytics/priority-distribution');
  return response.data;
};

export const getDepartmentTickets = async () => {
  const response = await api.get('/analytics/department-tickets');
  return response.data;
};
