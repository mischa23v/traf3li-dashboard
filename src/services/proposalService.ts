import api from './api'

// Proposal Types
export type ProposalStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn'

export interface Proposal {
  _id: string
  jobId: string
  lawyerId: string
  clientId: string
  coverLetter: string
  proposedRate: number
  estimatedDuration?: string
  status: ProposalStatus
  submittedAt: string
  respondedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateProposalData {
  jobId: string
  coverLetter: string
  proposedRate: number
  estimatedDuration?: string
}

// API Response Types
export interface ProposalsResponse {
  data: Proposal[]
  total: number
}

// API Functions
const proposalService = {
  // Create a new proposal (lawyer)
  createProposal: async (data: CreateProposalData): Promise<Proposal> => {
    const response = await api.post('/proposals', data)
    return response.data
  },

  // Get all proposals for a specific job (client only)
  getJobProposals: async (jobId: string): Promise<Proposal[]> => {
    const response = await api.get(`/proposals/job/${jobId}`)
    return response.data
  },

  // Get my proposals (lawyer)
  getMyProposals: async (): Promise<Proposal[]> => {
    const response = await api.get('/proposals/my-proposals')
    return response.data
  },

  // Accept a proposal (client)
  acceptProposal: async (proposalId: string): Promise<Proposal> => {
    const response = await api.patch(`/proposals/accept/${proposalId}`)
    return response.data
  },

  // Reject a proposal (client)
  rejectProposal: async (proposalId: string): Promise<Proposal> => {
    const response = await api.patch(`/proposals/reject/${proposalId}`)
    return response.data
  },

  // Withdraw a proposal (lawyer)
  withdrawProposal: async (proposalId: string): Promise<Proposal> => {
    const response = await api.patch(`/proposals/withdraw/${proposalId}`)
    return response.data
  },
}

export default proposalService
