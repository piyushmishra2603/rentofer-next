import { useState, useCallback } from 'react'

export function useToggle(initial = false){
  const [state,setState] = useState(initial)
  const on = useCallback(()=> setState(true),[])
  const off = useCallback(()=> setState(false),[])
  const toggle = useCallback(()=> setState(s=>!s),[])
  return { state, on, off, toggle }
}
