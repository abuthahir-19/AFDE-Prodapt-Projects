import api from '../api';

export const feedbackService = {
  getAll: (skip = 0, limit = 100) =>
    api.get('/feedback', { params: { skip, limit } }),

  getById: (id) =>
    api.get(`/feedback/${id}`),

  create: (data) =>
    api.post('/feedback', data),

  update: (id, data) =>
    api.put(`/feedback/${id}`, data),

  delete: (id) =>
    api.delete(`/feedback/${id}`),

  search: (params) =>
    api.get('/search', { params }),
};

export const etlService = {
  upload: (formData) =>
    api.post('/etl/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getJobs: (skip = 0, limit = 50) =>
    api.get('/etl/jobs', { params: { skip, limit } }),

  getJob: (jobId) =>
    api.get(`/etl/jobs/${jobId}`),
};

export const analyticsService = {
  getSummary: () =>
    api.get('/analytics/summary'),

  getPrograms: () =>
    api.get('/analytics/programs'),

  downloadReport: (params = {}) =>
    api.get('/reports/download', { params, responseType: 'blob' }),
};
