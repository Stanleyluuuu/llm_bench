import { useCallback, useRef, useState } from 'react'

// ---------------------------------------------------------------------------
// useAsyncAction — unified async operation hook with loading/success/error
// ---------------------------------------------------------------------------

type AsyncStatus = 'idle' | 'loading' | 'success' | 'error'

interface AsyncState<T> {
  status: AsyncStatus
  data: T | null
  error: string | null
}

interface UseAsyncActionReturn<T, A extends unknown[]> {
  status: AsyncStatus
  data: T | null
  error: string | null
  isLoading: boolean
  isError: boolean
  isSuccess: boolean
  execute: (...args: A) => Promise<T | null>
  reset: () => void
}

/**
 * Generic hook for managing async operations with loading/success/error states.
 *
 * @param asyncFn - The async function to execute
 * @param options - Optional callbacks for success/error
 *
 * @example
 * ```tsx
 * const { execute, isLoading, error } = useAsyncAction(
 *   (url: string) => validateModel(url),
 *   { onSuccess: (res) => console.log('validated', res) }
 * )
 * ```
 */
export function useAsyncAction<T, A extends unknown[]>(
  asyncFn: (...args: A) => Promise<T>,
  options?: {
    onSuccess?: (data: T) => void
    onError?: (error: string) => void
  },
): UseAsyncActionReturn<T, A> {
  const [state, setState] = useState<AsyncState<T>>({
    status: 'idle',
    data: null,
    error: null,
  })

  // Track current execution to prevent stale updates
  const executionIdRef = useRef(0)

  const execute = useCallback(
    async (...args: A): Promise<T | null> => {
      const currentId = ++executionIdRef.current
      setState({ status: 'loading', data: null, error: null })

      try {
        const result = await asyncFn(...args)
        // Only update if this is still the latest execution
        if (currentId === executionIdRef.current) {
          setState({ status: 'success', data: result, error: null })
          options?.onSuccess?.(result)
        }
        return result
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        if (currentId === executionIdRef.current) {
          setState({ status: 'error', data: null, error: message })
          options?.onError?.(message)
        }
        return null
      }
    },
    [asyncFn, options],
  )

  const reset = useCallback(() => {
    executionIdRef.current++
    setState({ status: 'idle', data: null, error: null })
  }, [])

  return {
    status: state.status,
    data: state.data,
    error: state.error,
    isLoading: state.status === 'loading',
    isError: state.status === 'error',
    isSuccess: state.status === 'success',
    execute,
    reset,
  }
}
