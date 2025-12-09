import { QueryClient } from '@tanstack/react-query'

export function createOptimisticMutation<TData, TVariables>({
  queryClient,
  queryKey,
  updateFn,
}: {
  queryClient: QueryClient
  queryKey: readonly unknown[]
  updateFn: (old: TData | undefined, variables: TVariables) => TData | undefined
}) {
  return {
    onMutate: async (variables: TVariables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey })

      // Snapshot previous value
      const previousData = queryClient.getQueryData<TData>(queryKey)

      // Optimistically update
      queryClient.setQueryData<TData>(queryKey, (old) => updateFn(old, variables))

      // Return context with snapshot
      return { previousData }
    },
    onError: (_error: unknown, _variables: TVariables, context: { previousData?: TData } | undefined) => {
      // Rollback on error
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
    },
    onSettled: async () => {
      // Invalidate without delay
      await queryClient.invalidateQueries({ queryKey })
    },
  }
}
