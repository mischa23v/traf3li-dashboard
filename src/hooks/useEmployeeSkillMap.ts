import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getEmployeeSkillMaps,
  getEmployeeSkillMap,
  updateEmployeeSkills,
  addSkillToEmployee,
  updateSkillProficiency,
  removeSkillFromEmployee,
  evaluateSkill,
  getSkillMatrix,
  findSkillGaps,
  findDepartmentSkillGaps,
  findEmployeesWithSkill,
  getSkillDistribution,
  recommendTraining,
  getDepartmentSkillSummary,
  compareEmployeeSkills,
  linkTrainingToSkillMap,
  exportSkillMatrix,
  exportSkillGaps,
  getSkillTrends,
  bulkUpdateEmployeeSkills,
  type SkillMapFilters,
  type AddEmployeeSkillData,
  type UpdateSkillProficiencyData,
  type EmployeeSkillDetail,
} from '@/services/employeeSkillMapService'

// ==================== Cache Configuration ====================
const STATS_STALE_TIME = 30 * 60 * 1000 // 30 minutes
const STATS_GC_TIME = 60 * 60 * 1000 // 1 hour
const LIST_STALE_TIME = 5 * 60 * 1000 // 5 minutes for lists

// Query keys
export const skillMapKeys = {
  all: ['skill-maps'] as const,
  lists: () => [...skillMapKeys.all, 'list'] as const,
  list: (filters?: SkillMapFilters) => [...skillMapKeys.lists(), filters] as const,
  details: () => [...skillMapKeys.all, 'detail'] as const,
  detail: (employeeId: string) => [...skillMapKeys.details(), employeeId] as const,
  matrix: (departmentId?: string) => [...skillMapKeys.all, 'matrix', departmentId] as const,
  skillGaps: (employeeId: string) => [...skillMapKeys.all, 'skill-gaps', employeeId] as const,
  departmentSkillGaps: (departmentId: string) => [
    ...skillMapKeys.all,
    'department-skill-gaps',
    departmentId,
  ] as const,
  employeesWithSkill: (skillId: string, minProficiency?: number) => [
    ...skillMapKeys.all,
    'employees-with-skill',
    skillId,
    minProficiency,
  ] as const,
  skillDistribution: (skillId: string) => [
    ...skillMapKeys.all,
    'distribution',
    skillId,
  ] as const,
  trainingRecommendations: (employeeId: string) => [
    ...skillMapKeys.all,
    'training-recommendations',
    employeeId,
  ] as const,
  departmentSummary: (departmentId: string) => [
    ...skillMapKeys.all,
    'department-summary',
    departmentId,
  ] as const,
  skillTrends: (employeeId: string, skillId: string) => [
    ...skillMapKeys.all,
    'trends',
    employeeId,
    skillId,
  ] as const,
}

// Get all employee skill maps
export const useEmployeeSkillMaps = (filters?: SkillMapFilters) => {
  return useQuery({
    queryKey: skillMapKeys.list(filters),
    queryFn: () => getEmployeeSkillMaps(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get employee skill map
export const useEmployeeSkillMap = (employeeId: string) => {
  return useQuery({
    queryKey: skillMapKeys.detail(employeeId),
    queryFn: () => getEmployeeSkillMap(employeeId),
    enabled: !!employeeId,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get skill matrix
export const useSkillMatrix = (departmentId?: string) => {
  return useQuery({
    queryKey: skillMapKeys.matrix(departmentId),
    queryFn: () => getSkillMatrix(departmentId),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Find employees with skill
export const useFindEmployeesWithSkill = (skillId: string, minProficiency?: number) => {
  return useQuery({
    queryKey: skillMapKeys.employeesWithSkill(skillId, minProficiency),
    queryFn: () => findEmployeesWithSkill(skillId, minProficiency),
    enabled: !!skillId,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get skill distribution
export const useSkillDistribution = (skillId: string) => {
  return useQuery({
    queryKey: skillMapKeys.skillDistribution(skillId),
    queryFn: () => getSkillDistribution(skillId),
    enabled: !!skillId,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get training recommendations
export const useTrainingRecommendations = (employeeId: string) => {
  return useQuery({
    queryKey: skillMapKeys.trainingRecommendations(employeeId),
    queryFn: () => recommendTraining(employeeId),
    enabled: !!employeeId,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get department skill summary
export const useDepartmentSkillSummary = (departmentId: string) => {
  return useQuery({
    queryKey: skillMapKeys.departmentSummary(departmentId),
    queryFn: () => getDepartmentSkillSummary(departmentId),
    enabled: !!departmentId,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get skill trends
export const useSkillTrends = (employeeId: string, skillId: string) => {
  return useQuery({
    queryKey: skillMapKeys.skillTrends(employeeId, skillId),
    queryFn: () => getSkillTrends(employeeId, skillId),
    enabled: !!employeeId && !!skillId,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Update employee skills (bulk)
export const useUpdateEmployeeSkills = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ employeeId, skills }: { employeeId: string; skills: EmployeeSkillDetail[] }) =>
      updateEmployeeSkills(employeeId, skills),
    onSuccess: (_, { employeeId }) => {
      queryClient.invalidateQueries({ queryKey: skillMapKeys.detail(employeeId) })
      queryClient.invalidateQueries({ queryKey: skillMapKeys.lists() })
      queryClient.invalidateQueries({ queryKey: skillMapKeys.matrix() })
    },
  })
}

// Add skill to employee
export const useAddSkillToEmployee = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ employeeId, skillData }: { employeeId: string; skillData: AddEmployeeSkillData }) =>
      addSkillToEmployee(employeeId, skillData),
    onSuccess: (_, { employeeId }) => {
      queryClient.invalidateQueries({ queryKey: skillMapKeys.detail(employeeId) })
      queryClient.invalidateQueries({ queryKey: skillMapKeys.lists() })
      queryClient.invalidateQueries({ queryKey: skillMapKeys.matrix() })
    },
  })
}

// Update skill proficiency
export const useUpdateSkillProficiency = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      employeeId,
      skillId,
      data,
    }: {
      employeeId: string
      skillId: string
      data: UpdateSkillProficiencyData
    }) => updateSkillProficiency(employeeId, skillId, data),
    onSuccess: (_, { employeeId }) => {
      queryClient.invalidateQueries({ queryKey: skillMapKeys.detail(employeeId) })
      queryClient.invalidateQueries({ queryKey: skillMapKeys.lists() })
      queryClient.invalidateQueries({ queryKey: skillMapKeys.matrix() })
    },
  })
}

// Remove skill from employee
export const useRemoveSkillFromEmployee = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ employeeId, skillId }: { employeeId: string; skillId: string }) =>
      removeSkillFromEmployee(employeeId, skillId),
    onSuccess: (_, { employeeId }) => {
      queryClient.invalidateQueries({ queryKey: skillMapKeys.detail(employeeId) })
      queryClient.invalidateQueries({ queryKey: skillMapKeys.lists() })
      queryClient.invalidateQueries({ queryKey: skillMapKeys.matrix() })
    },
  })
}

// Evaluate skill
export const useEvaluateSkill = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      employeeId,
      skillId,
      proficiency,
      evaluatorId,
      notes,
    }: {
      employeeId: string
      skillId: string
      proficiency: number
      evaluatorId: string
      notes?: string
    }) => evaluateSkill(employeeId, skillId, proficiency, evaluatorId, notes),
    onSuccess: (_, { employeeId, skillId }) => {
      queryClient.invalidateQueries({ queryKey: skillMapKeys.detail(employeeId) })
      queryClient.invalidateQueries({ queryKey: skillMapKeys.lists() })
      queryClient.invalidateQueries({ queryKey: skillMapKeys.matrix() })
      queryClient.invalidateQueries({ queryKey: skillMapKeys.skillTrends(employeeId, skillId) })
    },
  })
}

// Find skill gaps
export const useFindSkillGaps = () => {
  return useMutation({
    mutationFn: ({
      employeeId,
      requiredSkills,
    }: {
      employeeId: string
      requiredSkills: Array<{ skillId: string; proficiency: number }>
    }) => findSkillGaps(employeeId, requiredSkills),
  })
}

// Find department skill gaps
export const useFindDepartmentSkillGaps = () => {
  return useMutation({
    mutationFn: ({
      departmentId,
      requiredSkills,
    }: {
      departmentId: string
      requiredSkills: Array<{ skillId: string; proficiency: number }>
    }) => findDepartmentSkillGaps(departmentId, requiredSkills),
  })
}

// Compare employee skills
export const useCompareEmployeeSkills = () => {
  return useMutation({
    mutationFn: (employeeIds: string[]) => compareEmployeeSkills(employeeIds),
  })
}

// Link training to skill map
export const useLinkTrainingToSkillMap = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      employeeId,
      trainingData,
    }: {
      employeeId: string
      trainingData: {
        trainingId: string
        trainingName: string
        trainingNameAr: string
        completionDate: string
        skillsAcquired: string[]
        proficiencyGain?: number
      }
    }) => linkTrainingToSkillMap(employeeId, trainingData),
    onSuccess: (_, { employeeId }) => {
      queryClient.invalidateQueries({ queryKey: skillMapKeys.detail(employeeId) })
    },
  })
}

// Bulk update employee skills
export const useBulkUpdateEmployeeSkills = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (
      data: Array<{
        employeeId: string
        skillId: string
        proficiency: number
        evaluatedBy: string
      }>
    ) => bulkUpdateEmployeeSkills(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: skillMapKeys.lists() })
      queryClient.invalidateQueries({ queryKey: skillMapKeys.matrix() })
    },
  })
}

// Export skill matrix
export const useExportSkillMatrix = () => {
  return useMutation({
    mutationFn: (departmentId?: string) => exportSkillMatrix(departmentId),
  })
}

// Export skill gaps
export const useExportSkillGaps = () => {
  return useMutation({
    mutationFn: (departmentId?: string) => exportSkillGaps(departmentId),
  })
}
