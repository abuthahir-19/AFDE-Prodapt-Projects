import api from '../api';

export const uploadCSV = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/etl/upload', formData, {
    headers: { 'Content-Type': undefined },
  });
  return response.data;
};

export const getETLStatus = async () => {
  const response = await api.get('/etl/status');
  return response.data;
};
