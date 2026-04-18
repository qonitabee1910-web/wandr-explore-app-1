import { useState, useCallback } from 'react';

export function useUndoRedo<T>(initialState: T) {
  const [states, setStates] = useState<T[]>([initialState]);
  const [index, setIndex] = useState(0);

  const state = states[index];

  const setState = useCallback((newState: T | ((prev: T) => T), overwrite = false) => {
    setStates((prevStates) => {
      const current = prevStates[index];
      const resolvedNewState = typeof newState === 'function' ? (newState as any)(current) : newState;

      if (overwrite) {
        const nextStates = [...prevStates];
        nextStates[index] = resolvedNewState;
        return nextStates;
      }

      const nextStates = prevStates.slice(0, index + 1);
      nextStates.push(resolvedNewState);
      
      // Limit history to 50 steps
      if (nextStates.length > 50) {
        nextStates.shift();
      } else {
        setIndex((prev) => prev + 1);
      }
      
      return nextStates;
    });
  }, [index]);

  const undo = useCallback(() => {
    if (index > 0) {
      setIndex((prev) => prev - 1);
    }
  }, [index]);

  const redo = useCallback(() => {
    if (index < states.length - 1) {
      setIndex((prev) => prev + 1);
    }
  }, [index, states.length]);

  const reset = useCallback((newState: T) => {
    setStates([newState]);
    setIndex(0);
  }, []);

  return {
    state,
    setState,
    undo,
    redo,
    reset,
    canUndo: index > 0,
    canRedo: index < states.length - 1,
  };
}
