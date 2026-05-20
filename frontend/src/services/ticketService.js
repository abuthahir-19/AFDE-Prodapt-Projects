import api from '../api';

export const getAllTickets = async (skip = 0, limit = 100) => {
  const response = await api.get('/tickets', { params: { skip, limit } });
  return response.data;
};

export const getTicketById = async (ticketId) => {
  const response = await api.get(`/tickets/${ticketId}`);
  return response.data;
};

export const createTicket = async (ticketData) => {
  const response = await api.post('/tickets', ticketData);
  return response.data;
};

export const updateTicket = async (ticketId, ticketData) => {
  const response = await api.put(`/tickets/${ticketId}`, ticketData);
  return response.data;
};

export const deleteTicket = async (ticketId) => {
  const response = await api.delete(`/tickets/${ticketId}`);
  return response.data;
};

export const searchTickets = async ({ keyword, category, status, priority } = {}) => {
  const params = {};
  if (keyword) params.keyword = keyword;
  if (category) params.category = category;
  if (status) params.status = status;
  if (priority) params.priority = priority;
  const response = await api.get('/search', { params });
  return response.data;
};
