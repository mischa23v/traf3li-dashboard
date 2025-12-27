import { useQuery, useMutation } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config'
import { invalidateCache } from '@/lib/cache-invalidation'
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
const STATS_STALE_TIME = CACHE_TIMES.LONG // 30 minutes
const STATS_GC_TIME = CACHE_TIMES.GC_LONG // 1 hour
const LIST_STALE_TIME = CACHE_TIMES.MEDIUM // 5 minutes for lists

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
  return useMutation({
    mutationFn: (data: CreateSkillData) => createSkill(data),
    onSuccess: () => {
      invalidateCache.skills.lists()
      invalidateCache.skills.stats()
      invalidateCache.skills.active()
    },
  })
}

// Update skill
export const useUpdateSkill = () => {
  return useMutation({
    mutationFn: ({ skillId, data }: { skillId: string; data: UpdateSkillData }) =>
      updateSkill(skillId, data),
    onSuccess: (_, { skillId }) => {
      invalidateCache.skills.detail(skillId)
      invalidateCache.skills.lists()
      invalidateCache.skills.active()
    },
  })
}

// Delete skill
export const useDeleteSkill = () => {
  return useMutation({
    mutationFn: (skillId: string) => deleteSkill(skillId),
    onSuccess: () => {
      invalidateCache.skills.lists()
      invalidateCache.skills.stats()
      invalidateCache.skills.active()
    },
  })
}

// Bulk delete skills
export const useBulkDeleteSkills = () => {
  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteSkills(ids),
    onSuccess: () => {
      invalidateCache.skills.lists()
      invalidateCache.skills.stats()
      invalidateCache.skills.active()
    },
  })
}

// Export skills
export const useExportSkills = () => {
  return useMutation({
    mutationFn: (filters?: SkillFilters) => exportSkills(filters),
  })
}
