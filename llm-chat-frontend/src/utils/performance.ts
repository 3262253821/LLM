type Procedure = (...args: never[]) => void

export type Cancelable<T extends Procedure> = ((...args: Parameters<T>) => void) & {
  cancel: () => void
  flush: () => void
}

export function debounce<T extends Procedure>(fn: T, wait = 0): Cancelable<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let lastArgs: Parameters<T> | null = null

  const invoke = () => {
    const args = lastArgs
    lastArgs = null

    if (args) {
      fn(...args)
    }
  }

  const debounced = ((...args: Parameters<T>) => {
    lastArgs = args

    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      timeoutId = null
      invoke()
    }, wait)
  }) as Cancelable<T>

  debounced.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }

    lastArgs = null
  }

  debounced.flush = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }

    invoke()
  }

  return debounced
}

export function throttle<T extends Procedure>(fn: T, wait = 0): Cancelable<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let lastArgs: Parameters<T> | null = null
  let lastInvokeTime = 0

  const invoke = () => {
    const args = lastArgs
    lastArgs = null
    lastInvokeTime = Date.now()

    if (args) {
      fn(...args)
    }
  }

  const throttled = ((...args: Parameters<T>) => {
    lastArgs = args

    const now = Date.now()
    const remaining = wait - (now - lastInvokeTime)

    if (remaining <= 0 || remaining > wait) {
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
        timeoutId = null
      }

      invoke()
      return
    }

    if (timeoutId === null) {
      timeoutId = setTimeout(() => {
        timeoutId = null
        invoke()
      }, remaining)
    }
  }) as Cancelable<T>

  throttled.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }

    lastArgs = null
  }

  throttled.flush = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }

    if (lastArgs) {
      invoke()
    }
  }

  return throttled
}
