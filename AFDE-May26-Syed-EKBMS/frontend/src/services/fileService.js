import api from './api.js'

const fileService = {
  uploadFile: async (formData) => {
    const response = await api.post('/api/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  getArticleFiles: async (articleId) => {
    const response = await api.get(`/api/files/article/${articleId}`)
    return response.data
  },

  deleteFile: async (id) => {
    const response = await api.delete(`/api/files/${id}`)
    return response.data
  },

  getDownloadUrl: (id) => {
    const token = localStorage.getItem('kb_token')
    return `/api/files/${id}?token=${token}`
  },
}

export default fileService
