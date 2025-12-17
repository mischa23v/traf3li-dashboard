import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getSkills,
  getSkill,
  createSkill,
  updateSkill,
  deleteSkill,
  getSkillsByCategory,
  getSkillStats,
  bulkDeleteSkills,
  getActiveSkills,
  exportSkills,
  type SkillFilters,
  type CreateSkillData,
  type UpdateSkillData,
  type SkillCategory,
} from '@/services/skillService'

// ==================== Cache Configuration ====================
const STATS_STALE_TIME = 30 * 60 * 1000 // 30 minutes
const STATS_GC_TIME = 60 * 60 * 1000 // 1 hour
const LIST_STALE_TIME = 5 * 60 * 1000 // 5 minutes for lists

// Query keys
export const skillKeys = {
  all: ['skills'] as const,
  lists: () => [...skillKeys.all, 'list'] as const,
  list: (filters?: SkillFilters) => [...skillKeys.lists(), filters] as const,
  details: () => [...skillKeys.all, 'detail'] as const,
  detail: (id: string) => [...skillKeys.details(), id] as const,
  stats: () => [...skillKeys.all, 'stats'] as const,
  byCategory: (category: SkillCategory) => [...skillKeys.all, 'category', category] as const,
  active: () => [...skillKeys.all, 'active'] as const,
}

// Get all skills
export const useSkills = (filters?: SkillFilters) => {
  return useQuery({
    queryKey: skillKeys.list(filters),
    queryFn: () => getSkills(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get single skill
export const useSkill = (skillId: string) => {
  return useQuery({
    queryKey: skillKeys.detail(skillId),
    queryFn: () => getSkill(skillId),
    enabled: !!skillId,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get skill stats
export const useSkillStats = () => {
  return useQuery({
    queryKey: skillKeys.stats(),
    queryFn: getSkillStats,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get skills by category
export const useSkillsByCategory = (category: SkillCategory) => {
  return useQuery({
    queryKey: skillKeys.byCategory(category),
    queryFn: () => getSkillsByCategory(category),
    enabled: !!category,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get active skills
export const useActiveSkills = () => {
  return useQuery({
    queryKey: skillKeys.active(),
    queryFn: getActiveSkills,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Create skill
export const useCreateSkill = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateSkillData) => createSkill(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: skillKeys.lists() })
      queryClient.invalidateQueries({ queryKey: skillKeys.stats() })
      queryClient.invalidateQueries({ queryKey: skillKeys.active() })
    },
  })
}

// Update skill
export const useUpdateSkill = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ skillId, data }: { skillId: string; data: UpdateSkillData }) =>
      updateSkill(skillId, data),
    onSuccess: (_, { skillId }) => {
      queryClient.invalidateQueries({ queryKey: skillKeys.detail(skillId) })
      queryClient.invalidateQueries({ queryKey: skillKeys.lists() })
      queryClient.invalidateQueries({ queryKey: skillKeys.active() })
    },
  })
}

// Delete skill
export const useDeleteSkill = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (skillId: string) => deleteSkill(skillId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: skillKeys.lists() })
      queryClient.invalidateQueries({ queryKey: skillKeys.stats() })
      queryClient.invalidateQueries({ queryKey: skillKeys.active() })
    },
  })
}

// Bulk delete skills
export const useBulkDeleteSkills = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteSkills(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: skillKeys.lists() })
      queryClient.invalidateQueries({ queryKey: skillKeys.stats() })
      queryClient.invalidateQueries({ queryKey: skillKeys.active() })
    },
  })
}

// Export skills
export const useExportSkills = () => {
  return useMutation({
    mutationFn: (filters?: SkillFilters) => exportSkills(filters),
  })
}
