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
