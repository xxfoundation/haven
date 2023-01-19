import { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react'


interface Helpers {
  next: () => void
  previous: () => void
  reset: () => void
  canGoToNextStep: boolean
  canGoToPrevStep: boolean
  set: Dispatch<SetStateAction<number>>
}


type SetStepCallbackType = (step: number | ((step: number) => number)) => void


const useStep = (maxStep: number): [number, Helpers] => {
  const [currentStep, setCurrentStep] = useState(1)

  const canGoToNextStep = useMemo(
    () => currentStep + 1 <= maxStep,
    [currentStep, maxStep],
  )

  const canGoToPrevStep = useMemo(
    () => currentStep - 1 >= 1,
    [currentStep]
  )


  const set = useCallback<SetStepCallbackType>(
    (step) => {
      const newStep = step instanceof Function ? step(currentStep) : step

      if (newStep >= 1 && newStep <= maxStep) {
        setCurrentStep(newStep)
        return
      }

      throw new Error('Step not valid')

    },
    [maxStep, currentStep],
  )


  const next = useCallback(() => {
    if (canGoToNextStep) {
      setCurrentStep(step => step + 1)
    }

  }, [canGoToNextStep])


  const previous = useCallback(() => {
    if (canGoToPrevStep) {
      setCurrentStep(step => step - 1)
    }
  }, [canGoToPrevStep])


  const reset = useCallback(() => {
    setCurrentStep(1)
  }, [])


  return [
    currentStep,
    {
      next,
      previous,
      canGoToNextStep,
      canGoToPrevStep,
      set,
      reset,
    },

  ]

}


export default useStep