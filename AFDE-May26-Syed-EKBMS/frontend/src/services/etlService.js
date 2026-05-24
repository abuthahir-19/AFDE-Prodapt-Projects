import api from './api.js'

const etlService = {
  importFile: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/api/etl/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  getJobs: async () => {
    const response = await api.get('/api/etl/jobs')
    return response.data
  },

  getJob: async (id) => {
    const response = await api.get(`/api/etl/jobs/${id}`)
    return response.data
  },

  getSampleUrl: () => `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/etl/sample`,
}

export default etlService
