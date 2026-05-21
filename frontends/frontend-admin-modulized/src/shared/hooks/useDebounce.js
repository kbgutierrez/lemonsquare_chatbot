import { useEffect, useRef, useState } from "react"

export const useDebounce = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value)
  const timeoutRef = useRef(null)

  useEffect(() => {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timeoutRef.current)
  }, [value, delay])

  return debounced
}

export default useDebounce
