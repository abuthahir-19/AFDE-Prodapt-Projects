import api from './api.js'

const analyticsService = {
  getDashboardMetrics: async () => {
    const response = await api.get('/api/analytics/dashboard')
    return response.data
  },

  getPopularArticles: async () => {
    const response = await api.get('/api/analytics/popular-articles')
    return response.data
  },

  getRecentArticles: async () => {
    const response = await api.get('/api/analytics/recent-articles')
    return response.data
  },

  getCategoryStats: async () => {
    const response = await api.get('/api/analytics/category-stats')
    return response.data
  },

  getSearchTrends: async () => {
    const response = await api.get('/api/analytics/search-trends')
    return response.data
  },

  getArticleTrends: async () => {
    const response = await api.get('/api/analytics/article-trends')
    return response.data
  },

  getAuthorActivity: async () => {
    const response = await api.get('/api/analytics/author-activity')
    return response.data
  },

  getEngagementStats: async () => {
    const response = await api.get('/api/analytics/engagement-stats')
    return response.data
  },
}

export default analyticsService
