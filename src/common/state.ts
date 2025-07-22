import { produce } from 'immer'
import { shallowRef } from 'vue'

export function useState<T>(baseState: T) {
  const state = shallowRef(baseState)

  const update = (updater: (draft: T) => void, onChange?:(prev:T,next:T)=>void):{prev:T,next:T} => {
    const prev = state.value
    state.value = produce(prev, updater)
    onChange?.(prev,state.value)
    return { prev, next: state.value }
  }

  return [state, update] as const
}