import api from './api'

// Document Analysis Interfaces
export interface DocumentAnalysis {
  _id: string
  documentId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  extractedText?: string
  entities?: {
    type: string
    text: string
    confidence: number
  }[]
  classifications?: {
    category: string
    confidence: number
  }[]
  sentimentScore?: number
  keyPhrases?: string[]
  language?: string
  metadata?: Record<string, unknown>
  error?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface AnalysisStats {
  totalAnalyses: number
  pendingAnalyses: number
  completedAnalyses: number
  failedAnalyses: number
  averageProcessingTime: number
  byLanguage: {
    language: string
    count: number
  }[]
}

export interface SemanticSearchResult {
  documentId: string
  score: number
  highlights: string[]
  document?: {
    _id: string
    fileName: string
    category: string
  }
}

export interface SimilarDocument {
  documentId: string
  similarity: number
  document?: {
    _id: string
    fileName: string
    category: string
  }
}

export interface AnalysisReport {
  documentId: string
  fileName: string
  analysis: DocumentAnalysis
  insights: {
    type: string
    title: string
    description: string
    data: unknown
  }[]
  generatedAt: string
}

const documentAnalysisService = {
  // Analyze a document
  analyzeDocument: async (documentId: string): Promise<DocumentAnalysis> => {
    const response = await api.post(`/document-analysis/${documentId}`)
    return response.data
  },

  // Get analysis for a document
  getAnalysis: async (documentId: string): Promise<DocumentAnalysis> => {
    const response = await api.get(`/document-analysis/${documentId}`)
    return response.data
  },

  // Delete analysis
  deleteAnalysis: async (documentId: string): Promise<void> => {
    await api.delete(`/document-analysis/${documentId}`)
  },

  // Re-analyze document (force new analysis)
  reanalyzeDocument: async (documentId: string): Promise<DocumentAnalysis> => {
    const response = await api.post(`/document-analysis/${documentId}/reanalyze`)
    return response.data
  },

  // Get analysis status
  getAnalysisStatus: async (documentId: string): Promise<{ status: string; progress: number }> => {
    const response = await api.get(`/document-analysis/${documentId}/status`)
    return response.data
  },

  // Get analysis history for a document
  getAnalysisHistory: async (documentId: string): Promise<DocumentAnalysis[]> => {
    const response = await api.get(`/document-analysis/${documentId}/history`)
    return response.data
  },

  // Batch analyze multiple documents
  batchAnalyze: async (documentIds: string[]): Promise<{ jobId: string; count: number }> => {
    const response = await api.post('/document-analysis/batch', { documentIds })
    return response.data
  },

  // Semantic search across analyzed documents
  semanticSearch: async (query: string, filters?: {
    documentIds?: string[]
    categories?: string[]
    language?: string
    limit?: number
  }): Promise<SemanticSearchResult[]> => {
    const response = await api.get('/document-analysis/search', {
      params: { q: query, ...filters }
    })
    return response.data
  },

  // Find similar documents
  findSimilar: async (documentId: string, limit: number = 10): Promise<SimilarDocument[]> => {
    const response = await api.get(`/document-analysis/${documentId}/similar`, {
      params: { limit }
    })
    return response.data
  },

  // Generate analysis report
  generateReport: async (documentId: string, format: 'pdf' | 'json' = 'json'): Promise<AnalysisReport | Blob> => {
    const response = await api.get(`/document-analysis/${documentId}/report`, {
      params: { format },
      responseType: format === 'pdf' ? 'blob' : 'json'
    })
    return response.data
  },

  // Get analysis statistics
  getStats: async (): Promise<AnalysisStats> => {
    const response = await api.get('/document-analysis/stats')
    return response.data
  },
}

export default documentAnalysisService
